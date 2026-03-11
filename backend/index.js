const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Route imports
const pantryRoutes = require("./routes/pantry");
const recipeRoutes = require("./routes/recipes");
const groceryRoutes = require("./routes/grocery");
const aiRoutes = require("./routes/ai");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/ai", aiRoutes);

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
