const express = require('express');
const router = express.Router();
const {
    getOrders,
    updateStatus,
    markCollected,
    createOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getOrders) // Both admin and boutique (filtered by shopId in controller)
    .post(createOrder); // Clients

router.patch('/:id/status', authorize('boutique', 'admin'), updateStatus);
router.patch('/:id/collect', authorize('boutique', 'admin'), markCollected);

module.exports = router;
