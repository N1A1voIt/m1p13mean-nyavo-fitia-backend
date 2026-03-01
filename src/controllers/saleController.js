const saleService = require('../services/saleService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Shop Sales (POS) endpoints.
 */
exports.processSale = asyncHandler(async (req, res) => {
    // Force shopId from session if boutique
    if (req.user.role === 'boutique') {
        req.body.shopId = req.user.shopId;
    }

    const sale = await saleService.processSale(req.body);
    res.status(201).json({ success: true, data: sale });
});

exports.getSalesHistory = asyncHandler(async (req, res) => {
    const shopId = req.user.role === 'boutique' ? req.user.shopId : req.query.shopId;
    const sales = await saleService.getSalesHistory(shopId);
    res.status(200).json({ success: true, count: sales.length, data: sales });
});

exports.getShopStats = asyncHandler(async (req, res) => {
    const shopId = req.user.role === 'boutique' ? req.user.shopId : req.params.shopId;
    const stats = await saleService.getShopSalesStats(shopId);
    res.status(200).json({ success: true, data: stats });
});
