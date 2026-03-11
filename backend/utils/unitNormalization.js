// Converts whatever unit the user types in to a standard base unit.

// Weight conversions — everything maps to grams
const WEIGHT_TO_GRAMS = {
    g: 1,
    gram: 1,
    grams: 1,
    kg: 1000,
    kilogram: 1000,
    kilograms: 1000,
    oz: 28.3495,
    ounce: 28.3495,
    ounces: 28.3495,
    lb: 453.592,
    lbs: 453.592,
    pound: 453.592,
    pounds: 453.592,
};

// Volume conversions — everything maps to milliliters
const VOLUME_TO_ML = {
    ml: 1,
    milliliter: 1,
    milliliters: 1,
    l: 1000,
    liter: 1000,
    liters: 1000,
    tsp: 4.929,
    teaspoon: 4.929,
    teaspoons: 4.929,
    tbsp: 14.787,
    tablespoon: 14.787,
    tablespoons: 14.787,
    cup: 236.588,
    cups: 236.588,
    "fl oz": 29.5735,
    "fluid ounce": 29.5735,
    "fluid ounces": 29.5735,
    gal: 3785.41,
    gallon: 3785.41,
    gallons: 3785.41,
};

// Takes a quantity + unit and spits out the normalized version.
// e.g. (1, "lb") -> { quantity: 453.59, unit: "g" }
function normalizeUnit(quantity, unit) {
    const key = unit.toLowerCase().trim();

    if (WEIGHT_TO_GRAMS[key]) {
        return {
            quantity: Math.round(quantity * WEIGHT_TO_GRAMS[key] * 100) / 100,
            unit: "g",
        };
    }

    if (VOLUME_TO_ML[key]) {
        return {
            quantity: Math.round(quantity * VOLUME_TO_ML[key] * 100) / 100,
            unit: "ml",
        };
    }

    // unknown unit, pass through as-is
    return { quantity, unit: key };
}

module.exports = { normalizeUnit };
