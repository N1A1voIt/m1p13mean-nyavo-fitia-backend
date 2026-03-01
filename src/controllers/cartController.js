const cartService = require('../services/cartService');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({ success: true, data: cart });
});

exports.updateCart = asyncHandler(async (req, res) => {
    const { items } = req.body;
    const cart = await cartService.updateCart(req.user.id, items);
    res.status(200).json({ success: true, data: cart });
});

exports.clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.status(200).json({ success: true, data: [] });
});
