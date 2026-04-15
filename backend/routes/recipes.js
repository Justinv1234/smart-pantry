// Recipe routes — CRUD plus ingredient matching.
const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");
const PantryItem = require("../models/PantryItem");
const validate = require("../middleware/validate");
const { recipeSchema } = require("../validation/recipe.validation");
const { matchIngredients } = require("../utils/ingredientMatch");

// Get all saved recipes
router.get("/", async (req, res) => {
    const recipes = await Recipe.find({ user: req.user._id });
    res.json(recipes);
});

// Check one recipe against the pantry — shows matched, missing, and if it's cookable
router.get("/:id/match", async (req, res) => {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.user._id });

    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }

    const pantryItems = await PantryItem.find({ user: req.user._id });
    const pantryNames = pantryItems.map((item) => item.name);
    const result = matchIngredients(pantryNames, recipe.ingredients);

    res.json({
        recipe: recipe.name,
        ...result,
    });
});

// Check ALL recipes against the pantry at once
router.get("/match/all", async (req, res) => {
    const recipes = await Recipe.find({ user: req.user._id });
    const pantryItems = await PantryItem.find({ user: req.user._id });
    const pantryNames = pantryItems.map((item) => item.name);

    const results = recipes.map((recipe) => ({
        recipeId: recipe._id,
        recipe: recipe.name,
        ...matchIngredients(pantryNames, recipe.ingredients),
    }));

    res.json(results);
});

// Save a new recipe
router.post("/", validate(recipeSchema), async (req, res) => {
    const recipe = await Recipe.create({
        ...req.body,
        user: req.user._id,
    });
    res.status(201).json(recipe);
});

// Update a recipe
router.put("/:id", validate(recipeSchema), async (req, res) => {
    const recipe = await Recipe.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
});

// Delete a recipe
router.delete("/:id", async (req, res) => {
    const recipe = await Recipe.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe deleted" });
});

module.exports = router;
