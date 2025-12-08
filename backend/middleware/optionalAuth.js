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
        console.error("OptionalAuth Error:", err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = optionalAuth;
