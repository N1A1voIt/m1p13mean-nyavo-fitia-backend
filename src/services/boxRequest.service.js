import BoxRequest from '../models/boxRequest.model.js';
import Shop from '../models/shop.model.js';

export const createBoxRequest = async (shopId) => {
  // Check if shop exists
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error('Shop not found');
  // Prevent duplicate pending requests
  const existing = await BoxRequest.findOne({ shop: shopId, status: 'PENDING' });
  if (existing) throw new Error('A pending request already exists');
  return BoxRequest.create({ shop: shopId });
};

export const getBoxRequests = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    BoxRequest.find().populate('shop').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    BoxRequest.countDocuments(),
  ]);
  return { requests, total };
};

export const assignBoxToRequest = async (requestId, assignedBox) => {
  const request = await BoxRequest.findById(requestId);
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request already processed');

  // Update request status
  request.status = 'ASSIGNED';
  request.assignedBox = assignedBox;
  await request.save();

  // Also update the shop with the assigned boxId
  await Shop.findByIdAndUpdate(request.shop, { boxId: assignedBox });

  return request;
};