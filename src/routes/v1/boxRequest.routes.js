import { Router } from 'express';
import * as boxRequestController from '../../controllers/boxRequest.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Shop owner requests a box
router.post('/', authMiddleware, roleMiddleware([1]), boxRequestController.createBoxRequest);

// Admin views all box requests
router.get('/', authMiddleware, roleMiddleware([2]), boxRequestController.getBoxRequests);

// Admin assigns a box
router.patch('/:id/assign', authMiddleware, roleMiddleware([2]), boxRequestController.assignBox);

export default router;
