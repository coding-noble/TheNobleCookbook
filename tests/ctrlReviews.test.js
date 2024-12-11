const mockingoose = require('mockingoose');
const { getAllReviews, getReview } = require('../controllers/ctrlReviews');
const Review = require('../models/Review');

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

describe('Review Controller Tests', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return all reviews successfully', async () => {
        const mockReviews = [
            {
                _id: '6759bc3cfa7eebaadcb12f30',
                recipeId: '60c72b2f9eb1d24034c7c2e3',
                userId: '60c72b2f9eb1d24034c7c2e4',
                rating: 5,
                comment: 'Amazing recipe!',
                comments: [{ userId: '60c72b2f9eb1d24034c7c2e5', comment: 'Great!' }],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: '6759bc3cfa7eebaadcb12f31',
                recipeId: '60c72b2f9eb1d24034c7c2e3',
                userId: '60c72b2f9eb1d24034c7c2e6',
                rating: 4,
                comment: 'Very good!',
                comments: [{ userId: '60c72b2f9eb1d24034c7c2e7', comment: 'Nice!' }],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
        mockingoose(Review).toReturn(mockReviews, 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllReviews(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ rating: 5, comment: 'Amazing recipe!' }),
                expect.objectContaining({ rating: 4, comment: 'Very good!' }),
            ])
        );
    });

    test('should handle database error in getAllReviews', async () => {
        mockingoose(Review).toReturn(new Error('Database error'), 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllReviews(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });

    test('should return a review by ID successfully', async () => {
        const mockReview = {
            _id: '6759bc3cfa7eebaadcb12f33',
            recipeId: '60c72b2f9eb1d24034c7c2e3',
            userId: '60c72b2f9eb1d24034c7c2e4',
            rating: 5,
            comment: 'Amazing recipe!',
            comments: [{ userId: '60c72b2f9eb1d24034c7c2e5', comment: 'Great!' }],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockingoose(Review).toReturn(mockReview, 'findOne');

        const req = mockRequest({ id: '6759bc3cfa7eebaadcb12f33' });
        const res = mockResponse();

        await getReview(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ rating: 5, comment: 'Amazing recipe!' })
        );
    });

    test('should return 404 if review not found by ID', async () => {
        mockingoose(Review).toReturn(null, 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getReview(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Review not found',
        });
    });

    test('should handle database error in getReview', async () => {
        mockingoose(Review).toReturn(new Error('Database error'), 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getReview(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });
});
