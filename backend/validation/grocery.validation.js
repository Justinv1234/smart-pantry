const Joi = require("joi");

// grocery item validation
const grocerySchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().trim().min(1).required(),
    addedFromRecipe: Joi.string().trim().allow(null).default(null)
});

module.exports = {
    grocerySchema
};
