const Reservation = require('../models/Reservation');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new reservation
 * @route   POST /api/reservations
 * @access  Private (Client)
 */
exports.createReservation = asyncHandler(async (req, res) => {
    req.body.userId = req.user.id;

    // Optional: Check for availability/overlapping slots logic here

    const reservation = await Reservation.create(req.body);

    res.status(201).json({
        success: true,
        data: reservation
    });
});

/**
 * @desc    Get user's reservations
 * @route   GET /api/reservations/me
 * @access  Private (Client)
 */
exports.getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ userId: req.user.id })
        .populate('shopId', 'boxNumber location')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
    });
});

/**
 * @desc    Get shop's reservations
 * @route   GET /api/reservations/shop/:shopId
 * @access  Private (Boutique/Admin)
 */
exports.getShopReservations = asyncHandler(async (req, res) => {
    // Check if boutique is accessing their own shop
    if (req.user.role === 'boutique' && req.user.shopId.toString() !== req.params.shopId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const reservations = await Reservation.find({ shopId: req.params.shopId })
        .populate('userId', 'name email')
        .sort('date');

    res.status(200).json({
        success: true,
        count: reservations.length,
        data: reservations
    });
});

/**
 * @desc    Update reservation status
 * @route   PATCH /api/reservations/:id
 * @access  Private (Boutique/Admin/Client)
 */
exports.updateReservation = asyncHandler(async (req, res) => {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Check ownership/authorization
    if (req.user.role === 'client' && reservation.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: reservation
    });
});
