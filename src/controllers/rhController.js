const rhService = require('../services/rhService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for RH related requests.
 */
exports.getPlanning = asyncHandler(async (req, res) => {
    const planning = await rhService.getPlanning(req.query);
    res.status(200).json({ success: true, count: planning.length, data: planning });
});

exports.updateShifts = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.body.userId;
    const planning = await rhService.updateShifts(userId, req.body.shifts);
    res.status(200).json({ success: true, data: planning });
});

exports.recordAttendance = asyncHandler(async (req, res) => {
    const planning = await rhService.recordAttendance(req.user.id, req.body.type, req.body.location);
    res.status(200).json({ success: true, data: planning });
});
