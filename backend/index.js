const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// Route imports
const authRoutes = require("./routes/auth");
const pantryRoutes = require("./routes/pantry");
const recipeRoutes = require("./routes/recipes");
const groceryRoutes = require("./routes/grocery");
const aiRoutes = require("./routes/ai");

const authMiddleware = require("./middleware/auth");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "https://localhost:5173"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());

// General rate limit: 100 requests per 15 minutes per IP
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
}));

// Stricter limit on AI endpoint (OpenAI calls are expensive)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many AI requests, please wait a minute." }
});
app.use("/api/ai", aiLimiter);
// Express 5: req.query is read-only, so sanitize body and params manually
app.use((req, _res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});

// public routes
app.use("/api/auth", authRoutes);

// protected routes
app.use("/api/pantry", authMiddleware, pantryRoutes);
app.use("/api/recipes", authMiddleware, recipeRoutes);
app.use("/api/grocery", authMiddleware, groceryRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);

// Just a simple check to see if the server is alive
app.get("/", (req, res) => {
    res.json({
        message: "Smart Pantry API Running"
    });
});

// Useful for debugging — tells us if Mongo is actually connected
app.get("/health", (req, res) => {
    const state = mongoose.connection.readyState;

    const status = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting"
    };

    res.json({
        server: "Running",
        database: status[state] || "Unknown"
    });
});

const PORT = process.env.PORT || 3001;

// Connect to MongoDB first, then start the server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });

// Catches any errors that slip through the routes
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
