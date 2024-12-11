const User = require('../models/User');
const { check, validationResult } = require('express-validator');

/** Create a new user */
const createUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Create New User'

    // Validation
    await check('name').notEmpty().withMessage('Name is required').run(req);
    await check('email').isEmail().withMessage('A valid email is required').run(req);
    await check('provider').notEmpty().withMessage('OAuth provider is required').run(req);
    await check('providerId').notEmpty().withMessage('OAuth provider ID is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, provider, providerId, name, bio, avatarUrl } = req.body;

    try {
        // Check if the user already exists based on provider and providerId
        const existingUser = await User.findOne({
            "oauthProviders.provider": provider,
            "oauthProviders.providerId": providerId
        });

        if (existingUser) {
            return res.status(200).json({ message: "User already exists", user: existingUser });
        }

        // Create a new user
        const newUser = new User({
            email,
            oauthProviders: [{ provider, providerId }],
            profile: { name, bio: bio || '', avatarUrl: avatarUrl || '' }
        });

        // Save the user
        const savedUser = await newUser.save();

        return res.status(201).json(savedUser); // Return the saved user
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Failed to insert user" });
    }
};

/** Get all users */
const getAllUsers = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get All Users'

    try {
        const users = await User.find(); // Use Mongoose .find() method to get all users
        return res.status(200).json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Get a single user by ID */
const getUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get Single User by ID'

    const { id } = req.params;

    try {
        const user = await User.findById(id); // Use Mongoose .findById() to find user by ID

        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Update user by ID */
const updateUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Edit/Update User by ID'

    // Validation
    await check('email').optional().isEmail().withMessage('A valid email is required').run(req);
    await check('name').optional().notEmpty().withMessage('Name must not be empty').run(req);
    await check('bio').optional().notEmpty().withMessage('Bio must not be empty').run(req);
    await check('avatarUrl').optional().notEmpty().withMessage('Avatar URL must not be empty').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { email, name, bio, avatarUrl } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (email) {
            user.email = email;
        }

        if (name) {
            user.profile.name = name;
        }

        if (bio) {
            user.profile.bio = bio;
        }

        if (avatarUrl) {
            user.profile.avatarUrl = avatarUrl;
        }

        user.updatedAt = new Date();

        // Save the updated user document
        const updatedUser = await user.save();

        return res.status(200).json(updatedUser); // Return the updated user
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};


/** Delete user by ID */
const deleteUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Delete User by ID'

    await check('id').isMongoId().withMessage('Invalid user ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete the user
        await user.deleteOne({ _id: id });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
};
