const client = require("./openaiClient");

// Takes a list of ingredients the user has and asks OpenAI to come up with
async function generateRecipes(ingredients) {
    const prompt = `You are a cooking assistant.

Given the pantry ingredients:
${ingredients.join(", ")}

Generate exactly 3 recipes.

Return ONLY valid JSON in this exact format, with no extra text:

[
  {
    "name": "Recipe name",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step1", "step2"],
    "missingIngredients": ["ingredient not in pantry"]
  }
]`;

    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
    });

    return response.output_text;
}

module.exports = { generateRecipes };
