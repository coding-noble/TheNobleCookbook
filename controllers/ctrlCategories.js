const { getDatabase } = require("../data/database");
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

    try {
        const db = getDatabase();
        const result = await db.collection(DB_COLLECTION).insertOne(newCategory);
        if (result.insertedId) {
            return res.status(201).json({ _id: result.insertedId, ...newCategory });
        } else {
            return res.status(500).json({ error: "Failed to insert category" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
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

    try {
        const db = getDatabase();
        const result = await db.collection(DB_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $addToSet: { recipes: new ObjectId(recipeId) }, $set: { updatedAt: new Date() } }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ message: "Recipe added to category successfully" });
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

const getAllCategories = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Get All Categories'
    try {
        const db = getDatabase();
        const data = await db.collection(DB_COLLECTION).find().toArray();
        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

const getCategory = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Get Single Category by ID'
    const { id } = req.params;
    try {
        const db = getDatabase();
        const data = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(404).json({ error: "Category not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
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

    try {
        const db = getDatabase();
        const data = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });

        if (!data) {
            return res.status(404).json({ error: "Category not found" });
        }

        const updatedCategory = {
            ...data,
            name: name || data.name,
            description: description || data.description,
            updatedAt: updatedDate
        };

        await db.collection(DB_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedCategory });
        return res.status(200).json(updatedCategory);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
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

    try {
        const db = getDatabase();
        const data = await db.collection(DB_COLLECTION).findOne({ _id: new ObjectId(id) });

        if (!data) {
            return res.status(404).json({ error: "Category not found" });
        }

        await db.collection(DB_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory,
    deleteCategory,
    addRecipeToCategory
};
