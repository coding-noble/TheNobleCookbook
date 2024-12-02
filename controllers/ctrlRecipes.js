const { getDatabase } = require("../data/database");
const { handleDatabaseAction } = require("./util");
const { check, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");
const DB_COLLECTION = "recipes";

/** Create a new recipe */
const createRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Create New Recipe'

    await check('title').notEmpty().withMessage('Title is required').run(req);
    await check('description').notEmpty().withMessage('Description is required').run(req);
    await check('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be a non-empty list').run(req);
    await check('instructions').isArray({ min: 1 }).withMessage('Instructions must be a non-empty list').run(req);
    await check('categoryId').isMongoId().withMessage('Valid categoryId is required').run(req);
    await check('publisherId').isMongoId().withMessage('Valid publisherId is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, ingredients, instructions, categoryId, publisherId, image } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;

    const newRecipe = {
        title,
        description,
        ingredients,
        instructions,
        categoryId: new ObjectId(categoryId),
        publisherId: new ObjectId(publisherId),
        rating: 0,
        reviews: [],
        image: image || null,
        createdAt,
        updatedAt
    };

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).insertOne(newRecipe)
            .then(result => result.insertedId ?
                res.status(201).json({ _id: result.insertedId, ...newRecipe }) :
                res.status(500).json({ error: "Failed to create recipe" })),
        res
    );
};

/** Get all recipes */
const getAllRecipes = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Get All Recipes'

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).find().toArray().then(data => res.status(200).json(data)),
        res
    );
};

/** Get a single recipe by ID */
const getRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Get Single Recipe by ID'

    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => data ? res.status(200).json(data) : res.status(404).json({ error: "Recipe not found" })),
        res
    );
};

/** Update recipe by ID */
const updateRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Edit/Update Recipe by ID'

    await check('title').optional().notEmpty().withMessage('Title must not be empty').run(req);
    await check('description').optional().notEmpty().withMessage('Description must not be empty').run(req);
    await check('ingredients').optional().isArray({ min: 1 }).withMessage('Ingredients must be a non-empty list').run(req);
    await check('instructions').optional().isArray({ min: 1 }).withMessage('Instructions must be a non-empty list').run(req);
    await check('categoryId').optional().isMongoId().withMessage('Valid categoryId is required').run(req);
    await check('publisherId').optional().isMongoId().withMessage('Valid publisherId is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, ingredients, instructions, categoryId, publisherId, image } = req.body;
    const updatedAt = new Date();

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data) return res.status(404).json({ error: "Recipe not found" });
                const updatedRecipe = {
                    ...data,
                    title: title || data.title,
                    description: description || data.description,
                    ingredients: ingredients || data.ingredients,
                    instructions: instructions || data.instructions,
                    categoryId: categoryId ? new ObjectId(categoryId) : data.categoryId,
                    publisherId: publisherId ? new ObjectId(publisherId) : data.publisherId,
                    image: image || data.image,
                    updatedAt
                };
                return db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedRecipe })
                    .then(() => res.status(200).json(updatedRecipe));
            }),
        res
    );
};

/** Delete a recipe by ID */
const deleteRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Delete Recipe by ID'

    await check('id').isMongoId().withMessage('Invalid recipe ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data) return res.status(404).json({ error: "Recipe not found" });
                return db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) })
                    .then(() => res.status(200).json({ message: "Recipe deleted successfully" }));
            }),
        res
    );
};

/** Module Exports */
module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipe,
    updateRecipe,
    deleteRecipe
};
