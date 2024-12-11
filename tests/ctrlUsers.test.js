const mockingoose = require('mockingoose');
const { getAllUsers, getUser } = require('../controllers/ctrlUsers');
const User = require('../models/User');

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

describe('User Controller Tests', () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    test('should return all users successfully', async () => {
        const mockUsers = [
            {
                _id: '6759bc3cfa7eebaadcb12f30',
                email: 'user1@example.com',
                oauthProviders: [{ provider: 'google', providerId: '123' }],
                profile: { name: 'User One', bio: 'Bio of User One', avatarUrl: 'http://example.com/avatar1.jpg' },
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: '6759bc3cfa7eebaadcb12f31',
                email: 'user2@example.com',
                oauthProviders: [{ provider: 'facebook', providerId: '456' }],
                profile: { name: 'User Two', bio: 'Bio of User Two', avatarUrl: 'http://example.com/avatar2.jpg' },
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
        mockingoose(User).toReturn(mockUsers, 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ email: 'user1@example.com', role: 'user' }),
                expect.objectContaining({ email: 'user2@example.com', role: 'admin' }),
            ])
        );
    });

    test('should handle database error in getAllUsers', async () => {
        mockingoose(User).toReturn(new Error('Database error'), 'find');

        const req = mockRequest();
        const res = mockResponse();

        await getAllUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });

    test('should return a user by ID successfully', async () => {
        const mockUser = {
            _id: '6759bc3cfa7eebaadcb12f33',
            email: 'user1@example.com',
            oauthProviders: [{ provider: 'google', providerId: '123' }],
            profile: { name: 'User One', bio: 'Bio of User One', avatarUrl: 'http://example.com/avatar1.jpg' },
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockingoose(User).toReturn(mockUser, 'findOne');

        const req = mockRequest({ id: '6759bc3cfa7eebaadcb12f33' });
        const res = mockResponse();

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'user1@example.com', role: 'user' })
        );
    });

    test('should return 404 if user not found by ID', async () => {
        mockingoose(User).toReturn(null, 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
        });
    });

    test('should handle database error in getUser', async () => {
        mockingoose(User).toReturn(new Error('Database error'), 'findOne');

        const req = mockRequest({ id: 'nonexistent-id' });
        const res = mockResponse();

        await getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Database error',
        });
    });
});
