const boxService = require('../services/boxService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Box related requests.
 */
exports.getBoxes = asyncHandler(async (req, res) => {
    const boxes = await boxService.getAllBoxes(req.query);
    res.status(200).json({ success: true, count: boxes.length, data: boxes });
});

exports.getBox = asyncHandler(async (req, res) => {
    const box = await boxService.getBoxById(req.params.id);
    res.status(200).json({ success: true, data: box });
});

exports.createBox = asyncHandler(async (req, res) => {
    const box = await boxService.createBox(req.body);
    res.status(201).json({ success: true, data: box });
});

exports.updateBox = asyncHandler(async (req, res) => {
    const box = await boxService.updateBox(req.params.id, req.body);
    res.status(200).json({ success: true, data: box });
});

exports.assignTenant = asyncHandler(async (req, res) => {
    const { tenantId, contractUrl, endDate, monthlyRent, depositAmount, terms, startDate } = req.body;
    const result = await boxService.assignTenant(req.params.id, tenantId, {
        contractUrl, endDate, monthlyRent, depositAmount, terms, startDate
    });
    res.status(200).json({ success: true, data: result });
});

exports.releaseTenant = asyncHandler(async (req, res) => {
    const box = await boxService.releaseTenant(req.params.id);
    res.status(200).json({ success: true, data: box });
});

exports.getBoxContract = asyncHandler(async (req, res) => {
    const contract = await boxService.getBoxContract(req.params.id);
    res.status(200).json({ success: true, data: contract });
});

exports.deleteBox = asyncHandler(async (req, res) => {
    const result = await boxService.deleteBox(req.params.id);
    res.status(200).json({ success: true, data: result });
});
