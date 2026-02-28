const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Auth related requests.
 */
exports.register = asyncHandler(async (req, res) => {
    const response = await authService.register(req.body);
    res.status(201).json(response);
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        const error = new Error('Please provide an email and password');
        error.statusCode = 400;
        throw error;
    }

    const response = await authService.login(email, password);
    res.status(200).json(response);
});

exports.getMe = asyncHandler(async (req, res) => {
    // Re-fetch fresh from DB and resolve shopId via Box.currentTenant
    const User = require('../models/User');
    const Box = require('../models/Box');
    const user = await User.findById(req.user._id).select('-password');
    const box = await Box.findOne({ currentTenant: user._id });
    res.status(200).json({
        success: true,
        data: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopId: box ? box._id : null
        }
    });
});

exports.getUsers = asyncHandler(async (req, res) => {
    const users = await require('../models/User').find(req.query);
    res.status(200).json({ success: true, data: users });
});
