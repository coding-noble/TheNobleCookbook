const Review = require('../models/Review');
const { check, validationResult } = require('express-validator');

/** Create a new review */
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

    try {
        // Create a new review using the Mongoose model
        const newReview = new Review({
            recipeId,
            userId,
            rating,
            comment: comment || null
        });

        const savedReview = await newReview.save(); // Save to MongoDB using Mongoose

        return res.status(201).json(savedReview);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Failed to create review" });
    }
};

/** Add a comment to a review */
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

    try {
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Add the comment to the comments array
        review.comments.push({
            userId,
            comment,
            createdAt
        });

        review.updatedAt = new Date(); // Update the updatedAt field

        await review.save(); // Save the updated review

        return res.status(200).json({ message: "Comment added successfully", newComment: review.comments[review.comments.length - 1] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Get all reviews */
const getAllReviews = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Get All Reviews'

    try {
        const reviews = await Review.find(); // Mongoose .find() method to get all reviews
        return res.status(200).json(reviews);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Get a single review by ID */
const getReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Get Single Review by ID'

    const { id } = req.params;
    try {
        const review = await Review.findById(id); // Use Mongoose .findById() to find a review by ID

        if (review) {
            return res.status(200).json(review);
        } else {
            return res.status(404).json({ error: "Review not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Update review by ID */
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

    try {
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.updatedAt = new Date(); // Update the updatedAt field

        await review.save(); // Save the updated review

        return res.status(200).json(review);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Delete a review by ID */
const deleteReview = async (req, res) => {
    //#swagger.tags = ['Reviews']
    //#swagger.summary = 'Delete Review by ID'

    await check('id').isMongoId().withMessage('Invalid review ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        await review.deleteOne({ _id: id });

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getReview,
    updateReview,
    deleteReview,
    addCommentToReview
};
