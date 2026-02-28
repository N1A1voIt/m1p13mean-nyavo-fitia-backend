const express = require('express');
const router = express.Router();
const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getAccountingStats,
    getStockMovements,
    recordStockMovement
} = require('../controllers/shopERPController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('boutique', 'admin'));

router.route('/stock-movements')
    .get(getStockMovements)
    .post(recordStockMovement);

router.route('/')
    .get(getProducts)
    .post(addProduct);

router.route('/:id')
    .patch(updateProduct)
    .delete(deleteProduct);

router.get('/accounting/:shopId', getAccountingStats);

module.exports = router;
