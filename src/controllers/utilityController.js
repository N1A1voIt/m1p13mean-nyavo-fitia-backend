const utilityService = require('../services/utilityService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Utility readings and billing.
 */
exports.addReading = asyncHandler(async (req, res) => {
    const reading = await utilityService.addReading(req.body);
    res.status(201).json({ success: true, data: reading });
});

exports.getReadings = asyncHandler(async (req, res) => {
    const readings = await utilityService.getReadingsByBox(req.params.boxId);
    res.status(200).json({ success: true, data: readings });
});

exports.generateInvoices = asyncHandler(async (req, res) => {
    const invoices = await utilityService.generateUtilityInvoices();
    res.status(201).json({ success: true, count: invoices.length, data: invoices });
});
