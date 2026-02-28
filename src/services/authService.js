const User = require('../models/User');
const Box = require('../models/Box');
const jwt = require('jsonwebtoken');

/**
 * Service to handle Authentication logic.
 */
class AuthService {
    /**
     * Register a new user
     */
    async register(userData) {
        const { name, email, password, role, shopId } = userData;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('User already exists');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            shopId
        });

        return this.sendTokenResponse(user);
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        return this.sendTokenResponse(user);
    }

    /**
     * Helper to format token response
     * Resolves shopId by looking up the Box where currentTenant === user._id
     */
    async sendTokenResponse(user) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });

        // Find the box assigned to this user via currentTenant
        const box = await Box.findOne({ currentTenant: user._id });

        return {
            success: true,
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopId: box ? box._id : null
            }
        };
    }
}

module.exports = new AuthService();
