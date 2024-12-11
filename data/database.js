const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGODB_URL; // MongoDB connection string from the environment

// Initialize Mongoose connection
const initDb = async () => {
    if (!url) throw new Error("MONGODB_URL is not defined.");

    try {
        // Connect to MongoDB using Mongoose
        await mongoose.connect(url);

        console.log(`Connected to MongoDB database ${mongoose.connection.name}`);

    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw new Error("Database connection failed");
    }
};

// Export the Mongoose instance so you can use it across your app
module.exports = {
    initDb,
    mongoose, // Export mongoose itself to access models and perform queries
};
