const Invoice = require('../models/Invoice');
const Box = require('../models/Box');
const Sale = require('../models/Sale');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Global Finance Statistics.
 */
exports.getGlobalStats = asyncHandler(async (req, res) => {
    // 1. Total Rent Revenue (Paid Invoices)
    const rentRevenue = await Invoice.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 2. Total Shop Sales Revenue — POS (Completed Sales)
    const posRevenue = await Sale.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // 3. Total Shop Sales Revenue — Web Orders (confirmed/active)
    const orderRevenue = await Order.aggregate([
        { $match: { status: { $in: ['Confirmed', 'ReadyForCollect', 'Collected'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // 4. Pending Rent Revenue (Pending/Late Invoices)
    const pendingRent = await Invoice.aggregate([
        { $match: { status: { $in: ['Pending', 'Late'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 5. Box Occupancy Stats
    const totalBoxes = await Box.countDocuments();
    const occupiedBoxes = await Box.countDocuments({ status: 'Occupé' });

    const shopRevenue = (posRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0);

    res.status(200).json({
        success: true,
        data: {
            rentRevenue:   rentRevenue[0]?.total || 0,
            shopRevenue,
            posRevenue:    posRevenue[0]?.total  || 0,
            onlineRevenue: orderRevenue[0]?.total || 0,
            pendingRent:   pendingRent[0]?.total || 0,
            grandTotal:    (rentRevenue[0]?.total || 0) + shopRevenue,
            occupancy: {
                total:    totalBoxes,
                occupied: occupiedBoxes,
                rate: totalBoxes > 0 ? (occupiedBoxes / totalBoxes) * 100 : 0
            }
        }
    });
});
