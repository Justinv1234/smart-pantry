// Grocery list routes — users can add items manually or auto-generate
const express = require("express");
const router = express.Router();

const GroceryItem = require("../models/GroceryItem");
const Recipe = require("../models/Recipe");
const PantryItem = require("../models/PantryItem");
const validate = require("../middleware/validate");
const { grocerySchema } = require("../validation/grocery.validation");
const { matchIngredients } = require("../utils/ingredientMatch");
const { normalizeUnit } = require("../utils/unitNormalization");

// placeholder until auth is set up
const userId = "000000000000000000000000";

// Get the full grocery list
router.get("/", async (req, res) => {
    const items = await GroceryItem.find({ user: userId });
    res.json(items);
});

// Auto-generate grocery items from a recipe.
// upsert prevents duplicates
router.post("/generate/:recipeId", async (req, res) => {
    const recipe = await Recipe.findOne({ _id: req.params.recipeId, user: userId });

    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }

    const pantryItems = await PantryItem.find({ user: userId });
    const pantryNames = pantryItems.map((item) => item.name);
    const { missing } = matchIngredients(pantryNames, recipe.ingredients);

    const groceryItems = await Promise.all(
        missing.map((name) =>
            GroceryItem.findOneAndUpdate(
                { user: userId, name: name.toLowerCase() },
                {
                    user: userId,
                    name: name.toLowerCase(),
                    quantity: 1,
                    unit: "unit",
                    addedFromRecipe: recipe.name,
                },
                { upsert: true, new: true }
            )
        )
    );

    res.status(201).json({
        recipe: recipe.name,
        added: groceryItems,
    });
});

// Manually add something to the grocery list
router.post("/", validate(grocerySchema), async (req, res) => {
    const normalized = normalizeUnit(req.body.quantity, req.body.unit);
    const item = await GroceryItem.create({
        ...req.body,
        quantity: normalized.quantity,
        unit: normalized.unit,
        user: userId,
    });
    res.status(201).json(item);
});

// Update a grocery item
router.put("/:id", validate(grocerySchema), async (req, res) => {
    const normalized = normalizeUnit(req.body.quantity, req.body.unit);
    const item = await GroceryItem.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        { ...req.body, quantity: normalized.quantity, unit: normalized.unit },
        { new: true, runValidators: true }
    );

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
});

// Remove a single item from the list
router.delete("/:id", async (req, res) => {
    const item = await GroceryItem.findOneAndDelete({
        _id: req.params.id,
        user: userId,
    });

    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item removed from grocery list" });
});

// Wipe the whole grocery list clean
router.delete("/", async (req, res) => {
    const result = await GroceryItem.deleteMany({ user: userId });
    res.json({ message: `${result.deletedCount} item(s) cleared` });
});

module.exports = router;
