const mapService = require('../services/mapService');
const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/Product');
const MapFixedItem = require('../models/MapFixedItem');

/**
 * Controller for Client Map endpoints.
 */
exports.getShops = asyncHandler(async (req, res) => {
    const shops = await mapService.getMapShops();
    res.status(200).json({ success: true, count: shops.length, data: shops });
});

exports.getPointDetail = asyncHandler(async (req, res) => {
    const detail = await mapService.getMapPointDetail(req.params.id);
    res.status(200).json({ success: true, data: detail });
});

exports.getMarketplace = asyncHandler(async (req, res) => {
    const { category, search, shopId } = req.query;

    let query = { active: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (shopId) query.shopId = shopId;

    const products = await Product.find(query).populate({
        path: 'shopId',
        select: 'boxNumber location currentTenant',
        populate: { path: 'currentTenant', select: 'name' }
    });

    res.status(200).json({ success: true, count: products.length, data: products });
});

// ── Fixed Items ─────────────────────────────────────────────────────────────

exports.getFixedItems = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.floor !== undefined) filter.floor = Number(req.query.floor);
    const items = await MapFixedItem.find(filter).sort({ floor: 1, type: -1, label: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
});

exports.createFixedItem = asyncHandler(async (req, res) => {
    const item = await MapFixedItem.create(req.body);
    res.status(201).json({ success: true, data: item });
});

exports.updateFixedItem = asyncHandler(async (req, res) => {
    const item = await MapFixedItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, data: item });
});

exports.deleteFixedItem = asyncHandler(async (req, res) => {
    const item = await MapFixedItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, data: {} });
});
