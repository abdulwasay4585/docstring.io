const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        // If token is invalid, treat as guest (or should we error? Safer to treat as guest for now to avoid blocking)
        // But invalid token might mean expired session.
        // Let's set user null.
        req.user = null;
        next();
    }
};

module.exports = optionalAuth;
