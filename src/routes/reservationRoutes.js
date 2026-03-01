const express = require('express');
const {
    createReservation,
    getMyReservations,
    getShopReservations,
    updateReservation
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createReservation);
router.get('/me', getMyReservations);
router.get('/shop/:shopId', authorize('boutique', 'admin'), getShopReservations);
router.patch('/:id', updateReservation);

module.exports = router;
