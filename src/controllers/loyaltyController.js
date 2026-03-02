const loyaltyService = require('../services/loyaltyService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get current user loyalty record
 * @route   GET /api/loyalty/me
 * @access  Private
 */
exports.getMyLoyalty = asyncHandler(async (req, res) => {
    const loyalty = await loyaltyService.getLoyaltyRecord(req.user.id);
    res.status(200).json({
        success: true,
        data: loyalty
    });
});
