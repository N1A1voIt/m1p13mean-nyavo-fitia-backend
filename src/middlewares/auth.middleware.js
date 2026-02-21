import authService from '../services/auth.service.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware to verify Firebase ID token and attach user to request.
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('No token provided');
            error.status = 401;
            throw error;
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify token with Firebase
        const decodedToken = await authService.verifyFirebaseToken(idToken);

        // Attach decoded token to request
        req.user = decodedToken;

        next();
    } catch (error) {
        const status = error.status || 401;
        const message = error.message || 'Unauthorized';
        res.status(status).json(errorResponse(message, status));
    }
};

/**
 * Middleware to restrict access by role.
 * @param {number[]} allowedRoles 
 */
export const roleMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            // We need to check the DB to get the user's role
            const user = await authService.getUserByUid(req.user.uid);

            if (!user || !allowedRoles.includes(user.role)) {
                const error = new Error('Forbidden: You do not have permission to access this resource');
                error.status = 403;
                throw error;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export default authMiddleware;
