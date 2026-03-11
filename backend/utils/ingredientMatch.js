// Checks a recipe's ingredients against what's in the pantry.
// returns matched, missing, and cookable
function matchIngredients(pantryNames, recipeIngredients) {
    const pantrySet = new Set(pantryNames.map((n) => n.toLowerCase()));

    const matched = [];
    const missing = [];

    for (const ingredient of recipeIngredients) {
        if (pantrySet.has(ingredient.toLowerCase())) {
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
