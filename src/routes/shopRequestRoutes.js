const express = require('express');
const router = express.Router();
const { 
    createRequest, 
    getRequests, 
    updateRequestStatus 
} = require('../controllers/shopRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createRequest);
router.get('/', authorize('admin'), getRequests);
router.patch('/:id/status', authorize('admin'), updateRequestStatus);

module.exports = router;
