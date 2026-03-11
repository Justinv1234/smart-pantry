// Pantry routes — CRUD for pantry items plus expiration alerts.
// units auto-normalize on create/update
const express = require("express");
const router = express.Router();

const PantryItem = require("../models/PantryItem");
const validate = require("../middleware/validate");
const { pantrySchema } = require("../validation/pantry.validation");
const { EXPIRING_SOON_DAYS, withExpirationStatus } = require("../utils/expiration");
const { normalizeUnit } = require("../utils/unitNormalization");

// placeholder until auth is set up
const userId = "000000000000000000000000";

// Grab everything in the pantry, with expiration status attached
router.get("/", async (req, res) => {
    const items = await PantryItem.find({ user: userId });
    res.json(items.map((item) => withExpirationStatus(item)));
});

// Get items that are about to expire (within the next few days)
router.get("/expiring", async (req, res) => {
    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() + EXPIRING_SOON_DAYS);

    const items = await PantryItem.find({
        user: userId,
        expirationDate: { $gte: now, $lte: threshold },
    });

    res.json(items.map((item) => withExpirationStatus(item)));
});

// Get items that have already expired
router.get("/expired", async (req, res) => {
    const now = new Date();

    const items = await PantryItem.find({
        user: userId,
        expirationDate: { $lt: now },
    });

    res.json(items.map((item) => withExpirationStatus(item)));
});

// Add a new item to the pantry
router.post("/", validate(pantrySchema), async (req, res) => {
    const normalized = normalizeUnit(req.body.quantity, req.body.unit);
    const item = await PantryItem.create({
        ...req.body,
        quantity: normalized.quantity,
        unit: normalized.unit,
        user: userId,
    });
    res.status(201).json(item);
});

// Update an existing pantry item
router.put("/:id", validate(pantrySchema), async (req, res) => {
    const normalized = normalizeUnit(req.body.quantity, req.body.unit);
    const item = await PantryItem.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        { ...req.body, quantity: normalized.quantity, unit: normalized.unit },
        { new: true, runValidators: true }
    );

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.json(withExpirationStatus(item));
});

// Remove an item from the pantry
router.delete("/:id", async (req, res) => {
    const item = await PantryItem.findOneAndDelete({
        _id: req.params.id,
        user: userId,
    });

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted" });
});

module.exports = router;
