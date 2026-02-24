const express = require("express");
const router = express.Router();

const PantryItem = require("../models/PantryItem");
const validate = require("../middleware/validate");
const { pantrySchema } = require("../validation/pantry.validation");

// Temporary user ID (until auth is implemented)
const userId = "000000000000000000000000";

// GET all pantry items
router.get("/", async (req, res) => {
    const items = await PantryItem.find({ user: userId });
    res.json(items);
});

// CREATE pantry item
router.post("/", validate(pantrySchema), async (req, res) => {
    const item = await PantryItem.create({
        ...req.body,
        user: userId,
    });
    res.status(201).json(item);
});

// UPDATE pantry item
router.put("/:id", validate(pantrySchema), async (req, res) => {
    const item = await PantryItem.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        req.body,
        { new: true, runValidators: true }
    );

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
});

// DELETE pantry item
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