const shopERPService = require('../services/shopERPService');
const asyncHandler = require('../middleware/asyncHandler');
const Sale = require('../models/Sale');
const Order = require('../models/Order');
const mongoose = require('mongoose');

/**
 * Controller for Shop ERP (Inventory) endpoints.
 */
exports.getProducts = asyncHandler(async (req, res) => {
    // If boutique role, force their own shopId. If admin, allow query override.
    const shopId = req.user.role === 'boutique' ? req.user.shopId : (req.query.shopId || req.user.shopId);

    // Extract potential filter parameters from the query string
    const filters = {};
    if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
    }

    const products = await shopERPService.getProducts(shopId, filters);
    res.status(200).json({ success: true, count: products.length, data: products });
});

exports.addProduct = asyncHandler(async (req, res) => {
    // Ensure product is added to the user's shop
    if (req.user.role === 'boutique') {
        req.body.shopId = req.user.shopId;
    }

    const product = await shopERPService.addProduct(req.body);
    res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
    // In a real app we'd also verify ownership here
    const product = await shopERPService.updateProduct(req.params.id, req.body);
    res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    await shopERPService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, data: {} });
});

exports.getStockMovements = asyncHandler(async (req, res) => {
    const shopId = req.user.role === 'boutique' ? req.user.shopId : (req.query.shopId || req.user.shopId);
    if (!shopId) return res.status(400).json({ success: false, message: 'Shop ID required' });
    
    const movements = await shopERPService.getStockMovements(shopId);
    res.status(200).json({ success: true, count: movements.length, data: movements });
});

exports.recordStockMovement = asyncHandler(async (req, res) => {
    const shopId = req.user.role === 'boutique' ? req.user.shopId : req.body.shopId;
    if (!shopId) return res.status(400).json({ success: false, message: 'Shop ID required' });
    
    req.body.shopId = shopId;
    const result = await shopERPService.recordStockMovement(req.body);
    
    res.status(201).json({ success: true, data: result.movement, product: result.product });
});

exports.getAccountingStats = asyncHandler(async (req, res) => {
    const shopId = req.user.role === 'boutique' ? req.user.shopId : req.params.shopId;

    if (!shopId) {
        const error = new Error('Shop ID is required');
        error.statusCode = 400;
        throw error;
    }

    const oid = new mongoose.Types.ObjectId(shopId);

    // Date helpers
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Orders that represent confirmed/active revenue (not Pending, not Canceled)
    const activeOrderStatuses = { $in: ['Confirmed', 'ReadyForCollect', 'Collected'] };

    // ── POS Sales ────────────────────────────────────────────────────────────
    const [posLifetime, posMonth, posLastMonth, posToday, posByPayment, posTopProducts] =
    await Promise.all([
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]),
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed', createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed' } },
            { $group: { _id: '$paymentMethod', total: { $sum: '$totalAmount' } } }
        ]),
        Sale.aggregate([
            { $match: { shopId: oid, status: 'Completed' } },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, totalRev: { $sum: '$items.total' } } }
        ])
    ]);

    // ── Web Orders (confirmed, ready, or collected) ───────────────────────────
    const [orderLifetime, orderMonth, orderLastMonth, orderToday, orderTopProducts] =
    await Promise.all([
        Order.aggregate([
            { $match: { shopId: oid, status: activeOrderStatuses } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]),
        Order.aggregate([
            { $match: { shopId: oid, status: activeOrderStatuses, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            { $match: { shopId: oid, status: activeOrderStatuses, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            { $match: { shopId: oid, status: activeOrderStatuses, createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            { $match: { shopId: oid, status: activeOrderStatuses } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.name',
                totalQty: { $sum: '$items.quantity' },
                totalRev: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }}
        ])
    ]);

    // ── Combine top products ─────────────────────────────────────────────────
    const productMap = {};
    for (const p of [...posTopProducts, ...orderTopProducts]) {
        if (!productMap[p._id]) productMap[p._id] = { _id: p._id, totalQty: 0, totalRev: 0 };
        productMap[p._id].totalQty += p.totalQty;
        productMap[p._id].totalRev += p.totalRev;
    }
    const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 5);

    // ── Totals ───────────────────────────────────────────────────────────────
    const posRevenue    = posLifetime[0]?.total    || 0;
    const onlineRevenue = orderLifetime[0]?.total  || 0;
    const posMonthRev   = posMonth[0]?.total       || 0;
    const onlineMonthRev = orderMonth[0]?.total    || 0;
    const posLastMonthRev = posLastMonth[0]?.total || 0;
    const onlineLastMonthRev = orderLastMonth[0]?.total || 0;
    const posTodayRev   = posToday[0]?.total       || 0;
    const onlineTodayRev = orderToday[0]?.total    || 0;

    const thisMonthRevenue = posMonthRev + onlineMonthRev;
    const lastMonthRevenue = posLastMonthRev + onlineLastMonthRev;
    const growthPct = lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : null;

    const byPayment = [
        ...posByPayment,
        ...(onlineRevenue > 0 ? [{ _id: 'Online', total: onlineRevenue }] : [])
    ];

    res.status(200).json({
        success: true,
        data: {
            lifetimeRevenue:  posRevenue + onlineRevenue,
            posRevenue,
            onlineRevenue,
            posCount:         posLifetime[0]?.count  || 0,
            onlineCount:      orderLifetime[0]?.count || 0,
            todayRevenue:     posTodayRev + onlineTodayRev,
            thisMonthRevenue,
            lastMonthRevenue,
            growthPct,
            byPayment,
            topProducts
        }
    });
});
