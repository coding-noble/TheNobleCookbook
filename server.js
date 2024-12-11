const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const routes = require("./routes");
const { initDb } = require("./data/database");

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
    .use(passport.initialize())
    .use(passport.session())
    .use(cors(
        {
            origin: "*",
            methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"]
        }))
    .use("/", routes);

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

// Start server and connect to MongoDB using Mongoose
const startServer = async () => {
    try {
        await initDb(); // Initializes Mongoose connection
        app.listen(port, () => console.log(`Server running: http://localhost:${port}`));
    } catch (err) {
        console.error('Database initialization error:', err);
        process.exit(1); // Exit if DB connection fails
    }
};

startServer();
