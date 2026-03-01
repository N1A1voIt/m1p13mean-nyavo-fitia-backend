const express = require('express');
const router = express.Router();
const {
    processSale,
    getSalesHistory,
    getShopStats
} = require('../controllers/saleController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('boutique', 'admin'));

router.post('/', processSale);
router.get('/history', getSalesHistory);
router.get('/stats/:shopId', getShopStats);

module.exports = router;
