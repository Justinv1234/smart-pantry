// AI routes — sends ingredients to OpenAI and gets back recipe ideas.
const express = require("express");
const router = express.Router();

const { generateRecipes } = require("../services/ai/recipeService");

// Send a list of ingredients, get back 3 recipe suggestions
router.post("/recipes", async (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: "ingredients must be a non-empty array" });
    }

    try {
        const result = await generateRecipes(ingredients);
        res.json({ recipes: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: "Failed to generate recipes", error: err.message });
    }
});

module.exports = router;
