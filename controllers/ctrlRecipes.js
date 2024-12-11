const { check, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');

/** Create a new recipe */
const createRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Create New Recipe'

    // Validation
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

    try {
        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            instructions,
            categoryId,
            publisherId,
            rating: 0,
            reviews: [],
            image: image || null,
            createdAt,
            updatedAt
        });

        const savedRecipe = await newRecipe.save();
        return res.status(201).json(savedRecipe);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Failed to create recipe" });
    }
};

/** Get all recipes */
const getAllRecipes = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Get All Recipes'

    try {
        const recipes = await Recipe.find();
        return res.status(200).json(recipes);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Get a single recipe by ID */
const getRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Get Single Recipe by ID'

    const { id } = req.params;
    try {
        const recipe = await Recipe.findById(id);
        if (recipe) {
            return res.status(200).json(recipe);
        } else {
            return res.status(404).json({ error: "Recipe not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Update recipe by ID */
const updateRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Edit/Update Recipe by ID'

    // Validation
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

    try {
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        // Update the recipe fields
        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.instructions = instructions || recipe.instructions;
        recipe.categoryId = categoryId || recipe.categoryId;
        recipe.publisherId = publisherId || recipe.publisherId;
        recipe.image = image || recipe.image;
        recipe.updatedAt = updatedAt;

        // Save the updated recipe
        const updatedRecipe = await recipe.save();
        return res.status(200).json(updatedRecipe);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Delete a recipe by ID */
const deleteRecipe = async (req, res) => {
    //#swagger.tags = ['Recipes']
    //#swagger.summary = 'Delete Recipe by ID'

    // Validation
    await check('id').isMongoId().withMessage('Invalid recipe ID').run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        // Delete the recipe
        await recipe.deleteOne({ _id: id });

        return res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Database action error" });
    }
};

/** Module Exports */
module.exports = {
    createRecipe,
    getAllRecipes,
    getRecipe,
    updateRecipe,
    deleteRecipe
};
