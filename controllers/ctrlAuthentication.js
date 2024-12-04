const passport = require('passport');
const { getDatabase } = require("../data/database");

// GitHub login route handler
exports.githubLogin = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Login GitHub'
    passport.authenticate('github')(req, res, next);
};

// Google login route handler
exports.googleLogin = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Login Google'
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// GitHub callback route handler
exports.githubCallback = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'GitHub Callback'
    passport.authenticate('github', { failureRedirect: '/' })(req, res, async () => {

        try {
            // Extract GitHub user data
            const { nodeId, displayName, provider, email, avatar_url, bio } = req.user;
            const createdAt = new Date();
            const updatedAt = createdAt;
            const role = "user";

            const newUser = {
                email: email,
                oauthProviders: [{
                    provider: provider,
                    providerId: nodeId
                }],
                profile: {
                    name: displayName || '',
                    bio: bio || '',
                    avatarUrl: avatar_url || '',
                },
                role: role,
                createdAt: createdAt,
                updatedAt: updatedAt
            };

            // Check if the user already exists based on provider and providerId
            const db = getDatabase();
            const existingUser = await db.collection("users").findOne({
                "oauthProviders.provider": provider,
                "oauthProviders.providerId": nodeId
            });

            if (existingUser) {
                // If the user exists, return the existing user
                req.session.user = existingUser;
                return res.redirect('/');
            }

            // If the user doesn't exist, create a new user
            const createdUser = await db.collection("users").insertOne(newUser);

            if (createdUser.insertedId) {
                req.session.user = { _id: createdUser.insertedId, ...newUser };
                return res.redirect('/');
            } else {
                return res.status(500).json({ error: "Failed to insert user" });
            }

        } catch (err) {
            next(err);
        }
    });
};

// Google callback route handler
exports.googleCallback = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Google Callback'
    passport.authenticate('google', { failureRedirect: '/' })(req, res, async () => {
        try {
            // Extract Google user data from req.user
            const { displayName, provider, _json } = req.user;
            const sub = _json.sub;
            const email = _json.email || null;
            const picture = _json.picture || '';

            const createdAt = new Date();
            const updatedAt = createdAt;
            const role = "user";

            const newUser = {
                email: email,
                oauthProviders: [{
                    provider: provider,
                    providerId: sub
                }],
                profile: {
                    name: displayName || '',
                    bio: '',
                    avatarUrl: picture,
                },
                role: role,
                createdAt: createdAt,
                updatedAt: updatedAt
            };

            // Check if the user already exists based on provider and providerId
            const db = getDatabase();
            const existingUser = await db.collection("users").findOne({
                "oauthProviders.provider": provider,
                "oauthProviders.providerId": sub
            });

            if (existingUser) {
                // If the user exists, return the existing user
                req.session.user = existingUser;
                return res.redirect('/');
            }

            // If the user doesn't exist, create a new user
            const createdUser = await db.collection("users").insertOne(newUser);

            if (createdUser.insertedId) {
                req.session.user = { _id: createdUser.insertedId, ...newUser };
                return res.redirect('/');
            } else {
                return res.status(500).json({ error: "Failed to insert user" });
            }

        } catch (err) {
            next(err);
        }
    });
};

// Logout route handler
exports.logout = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Logout'
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};
