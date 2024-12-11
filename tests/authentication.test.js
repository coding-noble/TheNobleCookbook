const { isLoggedIn, hasAdminAccess } = require('../middleware/authentication');

describe('Authentication and Authorization Middleware', () => {

    let req, res, next;

    beforeEach(() => {
        req = {
            session: {}
        };
        res = {
            statusCode: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (message) {
                this.message = message;
            }
        };
        next = jest.fn();
    });

    describe('isLoggedIn Middleware', () => {
        it('should respond with 401 if the user is not logged in', () => {
            req.session = {};

            isLoggedIn(req, res, next);

            expect(res.statusCode).toBe(401);
            expect(res.message).toBe("You need to be logged in.");
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if the user is logged in', () => {
            req.session.user = { _id: "123", email: 'test@example.com' };
            isLoggedIn(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('hasAdminAccess Middleware', () => {
        it('should respond with 401 if the user is not logged in', () => {
            req.session = {};
            hasAdminAccess(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res.message).toBe("You need to be logged in.");
            expect(next).not.toHaveBeenCalled();
        });

        it('should respond with 401 if the user is not an admin', () => {
            req.session.user = { _id: "123", email: 'test@example.com', role: 'user' };
            hasAdminAccess(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(res.message).toBe("Only Admins can do that");
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if the user is an admin', () => {
            req.session.user = { _id: "123", email: 'admin@example.com', role: 'ADMIN' };
            hasAdminAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
