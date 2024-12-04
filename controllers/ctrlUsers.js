const { getDatabase } = require("../data/database");
const { handleDatabaseAction } = require("./util");
const { check, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");
const DB_COLLECTION = "users"

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

    // Extract user data
    const { email, provider, providerId, name, bio, avatarUrl } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const role = "user";

    const db = getDatabase();
    const existingUser = await db.collection(DB_COLLECTION).findOne({
        "oauthProviders.provider": provider,
        "oauthProviders.providerId": providerId
    });

    if (existingUser) {
        // If the user exists, return the existing user
        return res.status(200).json({ message: "User already exists", user: existingUser });
    }

    // Build New User
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

    // Insert into DB
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).insertOne(newUser)
            .then(result =>
                result.insertedId
                    ? res.status(201).json({ _id: result.insertedId, ...newUser })
                    : res.status(500).json({ error: "Failed to insert user" })
            ),
        res
    );
};


const getAllUsers = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get All Users'
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).find().toArray().then(data =>
            res.status(200).json(data)), res);
};

const getUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Get Single User by ID'
    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => data ? res.status(200).json(data) : res.status(404).json({ error: "User not found" })),
        res
    );
};

const updateUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Edit/Update User by ID'

    // Validate
    await check('email').optional().isEmail().withMessage('A valid email is required').run(req);
    await check('name').optional().notEmpty().withMessage('Name must not be empty').run(req);
    await check('bio').optional().notEmpty().withMessage('Bio must not be empty').run(req);
    await check('avatarUrl').optional().notEmpty().withMessage('Avatar URL must not be empty').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract Parameters
    const { id } = req.params;
    const { email, name, bio, avatarUrl } = req.body;
    const updatedDate = new Date();

    // Update DB
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(user => {
                if (!user) return res.status(404).json({ error: "User not found" });

                // Update fields
                const updatedUser = {
                    ...user,
                    email: email || user.email,
                    profile: {
                        ...user.profile,
                        name: name || user.profile.name,
                        bio: bio || user.profile.bio,
                        avatarUrl: avatarUrl || user.profile.avatarUrl,
                    },
                    updatedAt: updatedDate
                };

                return db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedUser })
                    .then(() => res.status(200).json(updatedUser));
            }),
        res
    );
};

const deleteUser = async (req, res) => {
    //#swagger.tags = ['Users']
    //#swagger.summary = 'Delete User by ID'

    // Validate
    await check('id').isMongoId().withMessage('Invalid user ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Get ID
    const { id } = req.params;

    // Delete Category
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data)
                    return res.status(404).json({ error: "User not found" });
                return db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) })
                    .then(() => res.status(200).json({ message: "User deleted successfully" }))
            }),
        res
    );
};

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
};
