import express from 'express';
import authController from '../../controllers/auth.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/v1/auth/login
 * @desc  Login/Sync user via Firebase ID Token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/v1/auth/register
 * @desc  Register user/shop via Firebase ID Token
 * @access Public
 */
router.post('/register', authController.register);



/**
 * @route GET /api/v1/auth/me
 * @desc  Get current user details
 * @access Private
 */
router.get('/me', authMiddleware, authController.getMe);

export default router;
