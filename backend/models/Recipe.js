const mongoose = require("mongoose");

// Stores recipes that users save. The ingredients array is just strings
const recipeSchema = new mongoose.Schema(
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
        ingredients: {
            type: [String],
            required: true
        },
        instructions: {
            type: [String],
            default: []
        },
        portions: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
