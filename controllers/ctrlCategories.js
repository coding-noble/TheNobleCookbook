const Category = require('../models/Category');
const { check, validationResult } = require('express-validator');


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

    const { name, description } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;

    try {
        const newCategory = new Category({
            name,
            description,
            recipes: [],
            createdAt,
            updatedAt,
        });

        const result = await newCategory.save(); // Save the new category using Mongoose

        return res.status(201).json({ _id: result._id, ...newCategory.toObject() });
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
        const category = await Category.findById(id); // Use Mongoose to find the category

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        category.recipes.addToSet(recipeId);
        category.updatedAt = new Date();

        await category.save();

        return res.status(200).json({ message: "Recipe added to category successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

const getAllCategories = async (req, res) => {
    //#swagger.tags = ['Categories']
    //#swagger.summary = 'Get All Categories'
    try {
        const categories = await Category.find(); // Use Mongoose to find all categories
        return res.status(200).json(categories);
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
        const category = await Category.findById(id); // Use Mongoose to find category by ID
        if (category) {
            return res.status(200).json(category);
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
        const category = await Category.findById(id); // Find the category by ID

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Update the category
        category.name = name || category.name;
        category.description = description || category.description;
        category.updatedAt = updatedDate;

        await category.save(); // Save the updated category
        return res.status(200).json(category);
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
        const category = await Category.findById(id); // Use Mongoose to find the category

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        await category.deleteOne({ _id: id });
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
    addRecipeToCategory,
};
