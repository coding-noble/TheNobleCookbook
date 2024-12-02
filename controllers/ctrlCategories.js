const { getDatabase } = require("../data/database");
const { handleDatabaseAction } = require("./util");
const { check, validationResult } = require('express-validator');
const { ObjectId } = require("mongodb");
const DB_COLLECTION = "categories";

const createCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Create New Category'

    // Validation
    await check('name').notEmpty().withMessage('Name is required').run(req);
    await check('description').notEmpty().withMessage('Description is required').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Category Creation
    const { name, description } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;

    const newCategory = {
        name,
        description,
        recipes: [],
        createdAt,
        updatedAt
    };

    // Insert in DB
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).insertOne(newCategory)
            .then(result => result.insertedId ? res.status(201).json({ _id: result.insertedId, ...newCategory }) : res.status(500).json({ error: "Failed to insert category" })),
        res
    );
};

const addRecipeToCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Add Recipe ID to Category'

    // Validate
    await check('id').isMongoId().withMessage('Valid category ID is required').run(req);
    await check('recipeId').isMongoId().withMessage('Valid recipe ID is required').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { recipeId } = req.body;

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $addToSet: { recipes: new ObjectId(recipeId) }, $set: { updatedAt: new Date() } } // Add recipeId to the recipes array if not already present
        ).then(result =>
            result.modifiedCount > 0
                ? res.status(200).json({ message: "Recipe added to category successfully" })
                : res.status(404).json({ error: "Category not found" })
        ),
        res
    );
};

const getAllCategories = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Get All Categories'
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).find().toArray().then(data =>
            res.status(200).json(data)), res);
};

const getCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Get Single Category by ID'
    const { id } = req.params;
    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => data ? res.status(200).json(data) : res.status(404).json({ error: "Category not found" })),
        res
    );
};

const updateCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Edit/Update Category by ID'

    // Validate
    await check('name').optional().notEmpty().withMessage('name must not be empty').run(req);
    await check('description').optional().notEmpty().withMessage('Description must not be empty').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;
    const updatedDate = new Date();

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data) return res.status(404).json({ error: "Category not found" });
                const updatedCategory = {
                    ...data,
                    name: name || data.name,
                    description: description || data.description,
                    updatedAt: updatedDate
                };
                return db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedCategory })
                    .then(() => res.status(200).json(updatedCategory));
            }),
        res
    );
};

const deleteCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Delete Category by ID'

    // Validate
    await check('id').isMongoId().withMessage('Invalid category ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const db = getDatabase();
    handleDatabaseAction(() =>
        db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) })
            .then(data => {
                if (!data)
                    return res.status(404).json({ error: "Category not found" });
                return db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) })
                    .then(() => res.status(200).json({ message: "Category deleted successfully" }));
            }),
        res
    );
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    addRecipeToCategory
};
