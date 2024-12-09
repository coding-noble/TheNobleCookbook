const isLoggedIn = (req, res, next) => {
    if (req.session.user === undefined) {
        return res.status(401).json("You need to be logged in.");        
    }
    next();
}

const hasAdminAccess = (req, res, next) => {
    if (req.session.user === undefined) {
        if (req.session.user.role !== "ADMIN") {
            return res.status(401).json("Only Admins can do that");        
        }       
    }
    next();
}

module.exports = {
    isLoggedIn,
    hasAdminAccess
}