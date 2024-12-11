const mockingoose = require('mockingoose');
const { getAllRecipes, getRecipe } = require('../controllers/ctrlRecipes');
const Recipe = require('../models/Recipe');

const mockRequest = (params = {}, body = {}) => ({
    params,
    body,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Recipe Controller Tests', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return all recipes successfully', async () => {
        const mockRecipes = [
            {
                _id: '6759bc3cfa7eebaadcb12f30',
                title: 'Recipe 1',
                description: 'A delicious recipe 1',
                ingredients: ['Ingredient 1', 'Ingredient 2'],
                instructions: ['Step 1', 'Step 2'],
                categoryId: '60c72b2f9eb1d24034c7c2e3',
                publisherId: '60c72b2f9eb1d24034c7c2e4',
                rating: 4.5,
                reviews: [{ userId: '60c72b2f9eb1d24034c7c2e5', comment: 'Great!', rating: 5 }],
                image: 'recipe1.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: '6759bc3cfa7eebaadcb12f31',
                title: 'Recipe 2',
                description: 'A delicious recipe 2',
                ingredients: ['Ingredient 3', 'Ingredient 4'],
                instructions: ['Step 1', 'Step 2'],
                categoryId: '60c72b2f9eb1d24034c7c2e3',
                publisherId: '60c72b2f9eb1d24034c7c2e4',
                rating: 4.0,
                reviews: [{ userId: '60c72b2f9eb1d24034c7c2e5', comment: 'Good!', rating: 4 }],
                image: 'recipe2.jpg',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
        mockingoose(Recipe).toReturn(mockRecipes, 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllRecipes(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ title: 'Recipe 1', description: 'A delicious recipe 1' }),
                expect.objectContaining({ title: 'Recipe 2', description: 'A delicious recipe 2' }),
            ])
        );
    });

    test('should handle database error in getAllRecipes', async () => {
        mockingoose(Recipe).toReturn(new Error('Database error'), 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllRecipes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });

    test('should return a recipe by ID successfully', async () => {
        const mockRecipe = {
            _id: '6759bc3cfa7eebaadcb12f33',
            title: 'Recipe 1',
            description: 'A delicious recipe 1',
            ingredients: ['Ingredient 1', 'Ingredient 2'],
            instructions: ['Step 1', 'Step 2'],
            categoryId: '60c72b2f9eb1d24034c7c2e3',
            publisherId: '60c72b2f9eb1d24034c7c2e4',
            rating: 4.5,
            reviews: [{ userId: '60c72b2f9eb1d24034c7c2e5', comment: 'Great!', rating: 5 }],
            image: 'recipe1.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockingoose(Recipe).toReturn(mockRecipe, 'findOne');

        const req = mockRequest({ id: '6759bc3cfa7eebaadcb12f33' });
        const res = mockResponse();

        await getRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Recipe 1' })
        );
    });

    test('should return 404 if recipe not found by ID', async () => {
        mockingoose(Recipe).toReturn(null, 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Recipe not found',
        });
    });

    test('should handle database error in getRecipe', async () => {
        mockingoose(Recipe).toReturn(new Error('Database error'), 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getRecipe(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });
});
