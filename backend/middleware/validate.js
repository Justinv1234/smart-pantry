// Middleware that runs the request body through a Joi schema.
// returns 400 with details if validation fails
module.exports = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: "Validation error",
            details: error.details[0].message
        });
    }

    next();
};