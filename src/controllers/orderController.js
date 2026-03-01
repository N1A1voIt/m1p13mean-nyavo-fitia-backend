const orderService = require('../services/orderService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Shop Order management.
 */
exports.getOrders = asyncHandler(async (req, res) => {
    // If boutique role, filter by their own shopId. If client, filter by their clientId.
    let filter = {};
    if (req.user.role === 'boutique') {
        filter.shopId = req.user.shopId;
    } else if (req.user.role === 'client') {
        filter.clientId = req.user.id;
    }

    // Merge with status from query if provided
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const orders = await orderService.getOrders(filter);
    res.status(200).json({ success: true, count: orders.length, data: orders });
});

exports.createOrder = asyncHandler(async (req, res) => {
    // Force clientId from session (matches Order model field name)
    req.body.clientId = req.user.id;

    const order = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
});

exports.updateStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: order });
});

exports.markCollected = asyncHandler(async (req, res) => {
    const order = await orderService.markAsCollected(req.params.id);
    res.status(200).json({ success: true, data: order });
});
