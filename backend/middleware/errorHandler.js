// Global error handler — catches anything that wasn't handled in the routes.
// logs error and sends response
module.exports = (err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message || "Server Error"
    });
};