const express = require('express');
const { getMyLoyalty } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyLoyalty);

module.exports = router;
