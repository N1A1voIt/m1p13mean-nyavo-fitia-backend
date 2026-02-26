import express from 'express';
import shopController from '../../controllers/shop.controller.js';
import authMiddleware, { roleMiddleware } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../models/user.model.js';

const router = express.Router();

// All shop routes require the user to be authenticated
router.use(authMiddleware);

/**
 * Public/All accessible routes
 */
router.get('/all', shopController.getAllShops);

// Remaining routes require the user to have the SHOP role
router.use(roleMiddleware([ROLES.SHOP]));

/**
 * Shop Management
 */
router.get('/list', shopController.getMyShops);
router.post('/', shopController.createShop);
router.patch('/:id/box', shopController.assignBox);

/**
 * Inventory Management
 */
router.get('/products', shopController.getProducts);
router.post('/products', shopController.addProduct);
router.put('/products/:id', shopController.updateProduct);

/**
 * POS
 */
router.post('/sales', shopController.processSale);

/**
 * Orders (Click & Collect)
 */
router.get('/orders', shopController.getOrders);
router.patch('/orders/:id/pickup', shopController.markOrderPickedUp);

/**
 * Stock Movements
 */
router.get('/movements', shopController.getMovements);

export default router;
