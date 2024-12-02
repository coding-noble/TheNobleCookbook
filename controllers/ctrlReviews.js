const { getDatabase } = require("../data/database");
const { handleDatabaseAction } = require("./util");
const { check, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");
const DB_COLLECTION = "reviews";

const createReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Create New Review'

    // Validation
    await check('recipeId').isMongoId().withMessage('Valid recipeId is required').run(req);
    await check('userId').isMongoId().withMessage('Valid userId is required').run(req);
    await check('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { recipeId, userId, rating, comment } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;

    const newReview = {
        recipeId: new ObjectId(recipeId),
        userId: new ObjectId(userId),
        rating,
        comment: comment || null,
        comments: [], // Initialize empty comments array
        createdAt,
        updatedAt
    };

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).insertOne(newReview)
            .then(result => result.insertedId ? res.status(201).json({ _id: result.insertedId, ...newReview }) : res.status(500).json({ error: "Failed to create review" })),
        res
    );
};

const addCommentToReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Add Comment to Review'

    // Validation
    await check('id').isMongoId().withMessage('Valid review ID is required').run(req);
    await check('userId').isMongoId().withMessage('Valid userId is required').run(req);
    await check('comment').notEmpty().withMessage('Comment is required').isString().withMessage('Comment must be a string').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { userId, comment } = req.body;
    const createdAt = new Date();

    const newComment = {
        userId: new ObjectId(userId),
        comment,
        createdAt
    };

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $push: { comments: newComment }, $set: { updatedAt: new Date() } }
        ).then(result =>
            result.modifiedCount > 0
                ? res.status(200).json({ message: "Comment added successfully", newComment })
                : res.status(404).json({ error: "Review not found" })
        ),
        res
    );
};

const getAllReviews = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Get All Reviews'

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).find().toArray().then(data => res.status(200).json(data)),
        res
    );
};

const getReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Get Single Review by ID'

    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => data ? res.status(200).json(data) : res.status(404).json({ error: "Review not found" })),
        res
    );
};

const updateReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Edit/Update Review by ID'

    // Validation
    await check('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req);
    await check('comment').optional().isString().withMessage('Comment must be a string').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const updatedAt = new Date();

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data) return res.status(404).json({ error: "Review not found" });
                const updatedReview = {
                    ...data,
                    rating: rating || data.rating,
                    comment: comment || data.comment,
                    updatedAt
                };
                return db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedReview })
                    .then(() => res.status(200).json(updatedReview));
            }),
        res
    );
};

const deleteReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Delete Review by ID'

    await check('id').isMongoId().withMessage('Invalid review ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data) return res.status(404).json({ error: "Review not found" });
                return db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) })
                    .then(() => res.status(200).json({ message: "Review deleted successfully" }));
            }),
        res
    );
};

module.exports = {
    createReview,
    getAllReviews,
    getReview,
    updateReview,
    deleteReview,
    addCommentToReview
};
