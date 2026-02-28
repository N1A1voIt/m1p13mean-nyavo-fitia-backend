const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Box = require('../models/Box');

/**
 * Middleware to protect routes and verify JWT.
 * Attaches req.user to the request object.
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        // Find user and attach to request
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            const error = new Error('No user found with this id');
            error.statusCode = 404;
            return next(error);
        }

        // Resolve shopId from Box.currentTenant for boutique users
        // (admin sets Box.currentTenant, not User.shopId)
        if (req.user.role === 'boutique') {
            const box = await Box.findOne({ currentTenant: req.user._id });
            req.user.shopId = box ? box._id : null;
        }

        next();
    } catch (err) {
        const error = new Error('Not authorized to access this route');
        error.statusCode = 401;
        return next(error);
    }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const error = new Error(`User role ${req.user.role} is not authorized to access this route`);
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};

module.exports = { protect, authorize };
