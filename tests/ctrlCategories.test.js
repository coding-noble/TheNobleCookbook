const mockingoose = require('mockingoose');
const { getAllCategories, getCategory } = require('../controllers/ctrlCategories');
const Category = require('../models/Category');

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

describe('Category Controller Tests', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return all categories successfully', async () => {
        const mockCategories = [
            {
                _id: '6759bc3cfa7eebaadcb12f30',
                name: 'Category 1',
                createdAt: new Date(),
                updatedAt: new Date(),
                recipes: [],
            },
            {
                _id: '6759bc3cfa7eebaadcb12f31',
                name: 'Category 2',
                createdAt: new Date(),
                updatedAt: new Date(),
                recipes: [],
            }
        ];
        mockingoose(Category).toReturn(mockCategories, 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: 'Category 1' }),
                expect.objectContaining({ name: 'Category 2' }),
            ])
        );
    });

    test('should handle database error in getAllCategories', async () => {
        mockingoose(Category).toReturn(new Error('Database error'), 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });

    test('should return a category by ID successfully', async () => {
        const mockCategory = {
            _id: '6759bc3cfa7eebaadcb12f33',
            name: 'Category 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            recipes: []
        };
        mockingoose(Category).toReturn(mockCategory, 'findOne');

        const req = mockRequest({ id: '6759bc3cfa7eebaadcb12f33' });
        const res = mockResponse();

        await getCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Category 1' })
        );
    });

    test('should return 404 if category not found by ID', async () => {
        mockingoose(Category).toReturn(null, 'findOne');

        const req = mockRequest({ id: '1' });
        const res = mockResponse();

        await getCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Category not found',
        });
    });

    test('should handle database error in getCategory', async () => {
        mockingoose(Category).toReturn(new Error('Database error'), 'findOne');

        const req = mockRequest({ id: '1' });
        const res = mockResponse();

        await getCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });
});
