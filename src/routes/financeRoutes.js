const express = require('express');
const router = express.Router();
const { getGlobalStats } = require('../controllers/financeController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getGlobalStats);

module.exports = router;
