const Joi = require("joi");

// pantry item validation — unit gets normalized after this
const pantrySchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().trim().min(1).required(),
    category: Joi.string().trim().min(1).default("other"),
    expirationDate: Joi.date().required()
});

module.exports = {
    pantrySchema
};
