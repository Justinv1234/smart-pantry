const getClient = require("./openaiClient");

// Takes a list of ingredients the user has and asks OpenAI to come up with
async function generateRecipes(ingredients, preferences = "") {
    const preferencesLine = preferences.trim()
        ? `\nUser dietary preferences and restrictions: ${preferences.trim()}\nYou MUST follow these preferences strictly.\n`
        : "";

    const prompt = `You are a professional cooking assistant.

Given these pantry ingredients:
${ingredients.join(", ")}
${preferencesLine}
Generate exactly 3 complete, detailed recipes using as many of these ingredients as possible.

Return ONLY valid JSON — no markdown, no code fences, no extra text — in this exact format:

[
  {
    "name": "Recipe Name",
    "portions": "Serves 4",
    "ingredients": [
      "2 cups all-purpose flour",
      "1 tsp kosher salt",
      "3 tbsp olive oil"
    ],
    "instructions": [
      "Preheat the oven to 375°F (190°C) and line a baking sheet with parchment paper.",
      "In a large bowl, whisk together the flour and salt until evenly combined.",
      "Slowly drizzle in the olive oil while stirring with a fork until crumbly.",
      "Turn out onto a lightly floured surface and knead for 2 minutes until smooth.",
      "Bake for 20-25 minutes until golden brown and a toothpick inserted in the center comes out clean."
    ],
    "missingIngredients": ["ingredient used in recipe that is NOT in the pantry list above"]
  }
]

Rules:
- Every ingredient must include an exact quantity and unit (e.g. "2 cups", "1 tsp", "3 cloves", "200g").
- "portions" must specify how many people the recipe serves (e.g. "Serves 2", "Serves 4-6").
- "instructions" must have at least 5 detailed steps. Include specific temperatures, cooking times, and techniques in each step.
- "missingIngredients" lists only ingredients used in the recipe that are NOT present in the provided pantry list.`;

    const response = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
}

module.exports = { generateRecipes };
