const UNITS = new Set([
    "cup", "cups", "tsp", "tbsp", "tablespoon", "tablespoons",
    "teaspoon", "teaspoons", "oz", "ounce", "ounces", "lb", "lbs",
    "pound", "pounds", "g", "gram", "grams", "kg", "ml", "l",
    "liter", "liters", "clove", "cloves", "pinch", "dash",
    "handful", "can", "cans", "slice", "slices", "piece", "pieces",
    "large", "medium", "small",
]);

// Strips leading quantities and units so "2 cups flour" → "flour"
function normalizeIngredient(str) {
    return str
        .toLowerCase()
        .replace(/^\d[\d\s/.-]*/, "")   // strip leading number / fraction
        .trim()
        .split(/\s+/)
        .filter((w) => !UNITS.has(w))
        .join(" ")
        .trim();
}

// Checks a recipe's ingredients against what's in the pantry.
// Tries exact match first, then quantity/unit-stripped match.
// returns matched, missing, and cookable
function matchIngredients(pantryNames, recipeIngredients) {
    const pantrySet = new Set(pantryNames.map((n) => n.toLowerCase()));

    const matched = [];
    const missing = [];

    for (const ingredient of recipeIngredients) {
        const exact = ingredient.toLowerCase();
        const normalized = normalizeIngredient(ingredient);
        if (pantrySet.has(exact) || (normalized && pantrySet.has(normalized))) {
            matched.push(ingredient);
        } else {
            missing.push(ingredient);
        }
    }

    return {
        matched,
        missing,
        cookable: missing.length === 0,
    };
}

module.exports = { matchIngredients };
