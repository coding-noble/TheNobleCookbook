const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGODB_URL;
let db;

const initDb = async (dbName) => {
    if (!url) throw new Error("MONGODB_URL is not defined.");

    try {
        const client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        console.log(`Connected to MongoDB database: ${dbName}`);
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw new Error("Database connection failed");
    }
};

module.exports = {
    initDb,
    getDatabase: () => db,
};
