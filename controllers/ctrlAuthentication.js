const passport = require('passport');
const User = require('../models/User');  // Import the Mongoose User model

// GitHub login route handler
const githubLogin = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Login GitHub'
    passport.authenticate('github')(req, res, next);
};

// Google login route handler
const googleLogin = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Login Google'
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// GitHub callback route handler
const githubCallback = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'GitHub Callback'
    passport.authenticate('github', { failureRedirect: '/' })(req, res, async () => {
        try {
            const { nodeId, displayName, provider, email, avatar_url, bio } = req.user;
            const createdAt = new Date();
            const updatedAt = createdAt;
            const role = "user";

            const newUser = {
                email,
                oauthProviders: [{ provider, providerId: nodeId }],
                profile: {
                    name: displayName || '',
                    bio: bio || '',
                    avatarUrl: avatar_url || ''
                },
                role,
                createdAt,
                updatedAt
            };

            // Check if user already exists using Mongoose
            let existingUser = await User.findOne({
                "oauthProviders.provider": provider,
                "oauthProviders.providerId": nodeId
            });

            if (existingUser) {
                req.session.user = existingUser;  // Set user session
                return res.redirect('/');  // Redirect to home
            }

            // If user doesn't exist, create new user using Mongoose
            existingUser = await User.create(newUser);

            req.session.user = { _id: existingUser._id, ...newUser };  // Set user session
            return res.redirect('/');  // Redirect to home
        } catch (err) {
            next(err);
        }
    });
};

// Google callback route handler
const googleCallback = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Google Callback'
    passport.authenticate('google', { failureRedirect: '/' })(req, res, async () => {
        try {
            const { displayName, provider, _json } = req.user;
            const sub = _json.sub;
            const email = _json.email || null;
            const picture = _json.picture || '';

            const createdAt = new Date();
            const updatedAt = createdAt;
            const role = "user";

            const newUser = {
                email,
                oauthProviders: [{ provider, providerId: sub }],
                profile: {
                    name: displayName || '',
                    bio: '',
                    avatarUrl: picture,
                },
                role,
                createdAt,
                updatedAt
            };

            // Check if user already exists using Mongoose
            let existingUser = await User.findOne({
                "oauthProviders.provider": provider,
                "oauthProviders.providerId": sub
            });

            if (existingUser) {
                req.session.user = existingUser;  // Set user session
                return res.redirect('/');  // Redirect to home
            }

            // If user doesn't exist, create new user using Mongoose
            existingUser = await User.create(newUser);

            req.session.user = { _id: existingUser._id, ...newUser };  // Set user session
            return res.redirect('/');  // Redirect to home
        } catch (err) {
            next(err);
        }
    });
};

// Logout route handler
const logout = (req, res, next) => {
    //#swagger.tags = ['Login Authentication']
    //#swagger.summary = 'Logout'
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

module.exports = {
    githubLogin,
    googleLogin,
    githubCallback,
    googleCallback,
    logout
};
