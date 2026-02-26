
import express from 'express';
import authRoutes from './auth.routes.js';
import shopRoutes from './shop.routes.js';
import boxRequestRoutes from './boxRequest.routes.js';

const router = express.Router();


router.use('/auth', authRoutes);
router.use('/shop', shopRoutes);
router.use('/box-requests', boxRequestRoutes);

export default router;
