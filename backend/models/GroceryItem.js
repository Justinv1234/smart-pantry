const mongoose = require("mongoose");

// Items the user needs to buy. These can be added manually or
// can be added manually or auto-generated from a recipe
const groceryItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        unit: {
            type: String,
            required: true,
            trim: true
        },
        // Tracks which recipe triggered this item being added (null if added manually)
        addedFromRecipe: {
            type: String,
            trim: true,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GroceryItem", groceryItemSchema);
