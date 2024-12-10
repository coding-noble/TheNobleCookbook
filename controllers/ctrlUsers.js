const { getDatabase } = require("../data/database");
const { check, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");
const DB_COLLECTION = "users";

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
    const createdAt = new Date();
    const updatedAt = createdAt;
    const role = "user";

    try {
        const db = getDatabase();
        const existingUser = await db.collection(DB_COLLECTION).findOne({
            "oauthProviders.provider": provider,
            "oauthProviders.providerId": providerId
        });

        if (existingUser) {
            return res.status(200).json({ message: "User already exists", user: existingUser });
        }

        const newUser = {
            email,
            oauthProviders: [{ provider, providerId }],
            profile: {
                name: name || '',
                bio: bio || '',
                avatarUrl: avatarUrl || '',
            },
            role,
            createdAt,
            updatedAt
        };

        const result = await db.collection(DB_COLLECTION).insertOne(newUser);
        if (result.insertedId) {
            return res.status(201).json({ _id: result.insertedId, ...newUser });
        } else {
            return res.status(500).json({ error: "Failed to insert user" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Get all users */
const getAllUsers = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get All Users'

    try {
        const db = getDatabase();
        const users = await db.collection(DB_COLLECTION).find().toArray();
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
        const db = getDatabase();
        const user = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });

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
    const updatedAt = new Date();

    try {
        const db = getDatabase();
        const user = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedUser = {
            ...user,
            email: email || user.email,
            profile: {
                ...user.profile,
                name: name || user.profile.name,
                bio: bio || user.profile.bio,
                avatarUrl: avatarUrl || user.profile.avatarUrl,
            },
            updatedAt
        };

        await db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });
        return res.status(200).json(updatedUser);
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
        const db = getDatabase();
        const user = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) });
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
