const express = require('express');
const router = express.Router();
const { getShops, getPointDetail, getMarketplace, getFixedItems, createFixedItem, updateFixedItem, deleteFixedItem } = require('../controllers/mapController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/shops', getShops);
router.get('/detail/:id', getPointDetail);
router.get('/marketplace', getMarketplace);

// Fixed amenities / areas on the map
router.get('/fixed-items', getFixedItems);
router.post('/fixed-items', protect, authorize('admin'), createFixedItem);
router.put('/fixed-items/:id', protect, authorize('admin'), updateFixedItem);
router.delete('/fixed-items/:id', protect, authorize('admin'), deleteFixedItem);

module.exports = router;
