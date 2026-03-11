const Joi = require("joi");

// recipe validation
const recipeSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    ingredients: Joi.array().items(Joi.string().trim().min(1)).min(1).required()
});

module.exports = {
    recipeSchema
};
