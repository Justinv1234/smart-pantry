const Joi = require("joi");

const pantrySchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    quantity: Joi.number().min(0).required(),
    unit: Joi.string().trim().min(1).required(),
    expiration: Joi.date().required()
});

module.exports = {
    pantrySchema
};


