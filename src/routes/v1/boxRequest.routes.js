import { Router } from 'express';
import * as boxRequestController from '../../controllers/boxRequest.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Shop owner requests a box
router.post('/', authMiddleware, roleMiddleware([1]), boxRequestController.createBoxRequest);

// Get current request for a shop
router.get('/shop/:shopId', authMiddleware, roleMiddleware([1, 2]), boxRequestController.getBoxRequestByShop);

// Admin views all box requests
router.get('/', authMiddleware, roleMiddleware([2]), boxRequestController.getBoxRequests);

// Get all my shop requests
router.get('/mine', authMiddleware, roleMiddleware([1]), boxRequestController.getMyRequests);

// Admin assigns a box
router.patch('/:id/assign', authMiddleware, roleMiddleware([2]), boxRequestController.assignBox);

export default router;
