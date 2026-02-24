const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const pantryRoutes = require("./routes/pantry");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Pantry routes

app.use("/api/pantry", pantryRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Smart Pantry API Running"
    });
});

// Health check route
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

// MongoDB Connection
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

// Error handling middleware
const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);