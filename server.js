const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const mongodb = require("./data/database.js");
const routes = require("./routes");

// Strategies for Login Authentication
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const port = process.env.PORT || 2600;
const app = express();

// Middleware setup
app.use(bodyParser.json())
    .use(session({
        secret: "secret",
        resave: false,
        saveUninitialized: true
    }))
    .use(passport.initialize()) // Initialize Passport for authentication
    .use(passport.session()) // Use sessions for keeping users logged in
    .use(cors({ origin: "*", methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"] })) // CORS settings
    .use("/", routes); // Register all routes (taskRoutes, userRoutes, authRoutes, etc.)

// Root route
app.get('/', (req, res) => {
    res.send(req.session.user ? `Logged in as ${req.session.user.profile.name}` : "Logged Out");
});

// Configure GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

// Configure Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(async function (user, done) {
    done(null, user);
});

// Start server and connect to the database
const startServer = async () => {
    try {
        await mongodb.initDb("The-Noble-Cookbook"); // Initialize The Noble Cookbook DB
        app.listen(port, () => console.log(`Server running on http://localhost:${port}`)); // Start the server
    } catch (err) {
        console.error('Database initialization error:', err); // Handle any DB errors
        process.exit(1); // Exit the process if DB setup fails
    }
};

startServer();
