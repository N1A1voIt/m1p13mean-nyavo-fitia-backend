const express = require('express');
const router = express.Router();
const {
    getPlanning,
    updateShifts,
    recordAttendance
} = require('../controllers/rhController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/planning', getPlanning);
router.post('/planning/shift', updateShifts); // Assuming updateShift in the instruction refers to updateShifts
// In a real app, recordAttendance would use req.user.id from an auth middleware
router.post('/attendance', recordAttendance);

module.exports = router;
