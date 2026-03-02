const ShopRequest = require('../models/ShopRequest');
const asyncHandler = require('../middleware/asyncHandler');

exports.createRequest = asyncHandler(async (req, res) => {
    // Check if user already has a pending request
    const existing = await ShopRequest.findOne({ userId: req.user._id, status: 'pending' });
    if (existing) {
        return res.status(400).json({ success: false, message: 'You already have a pending request.' });
    }

    const request = await ShopRequest.create({
        userId: req.user._id,
        message: req.body.message || 'I would like to request a box assignment for my boutique.'
    });

    res.status(201).json({ success: true, data: request });
});

exports.getRequests = asyncHandler(async (req, res) => {
    const status = req.query.status || 'pending';
    const requests = await ShopRequest.find({ status }).populate('userId', 'name email');
    
    res.status(200).json({ success: true, count: requests.length, data: requests });
});

exports.updateRequestStatus = asyncHandler(async (req, res) => {
    const request = await ShopRequest.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
    );

    if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
});
