import * as boxRequestService from '../services/boxRequest.service.js';
import { createBoxRequestSchema, assignBoxSchema } from '../validators/boxRequest.validator.js';
import { successResponse } from '../utils/response.js';
import Shop from '../models/shop.model.js';

export const createBoxRequest = async (req, res, next) => {
  try {
    const { shop } = createBoxRequestSchema.parse(req.body);
    const boxRequest = await boxRequestService.createBoxRequest(shop);
    return res.json(successResponse({ boxRequest }, 200));
  } catch (err) {
    return next(err);
  }
};

export const getBoxRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await boxRequestService.getBoxRequests(page, limit);
    return res.json(successResponse(data, 200));
  } catch (err) {
    return next(err);
  }
};

export const getBoxRequestByShop = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const boxRequest = await boxRequestService.getBoxRequestByShopId(shopId);
    return res.json(successResponse({ boxRequest }, 200));
  } catch (err) {
    return next(err);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const shops = await Shop.find({ tenantId: uid });
    const shopIds = shops.map(s => s._id);
    const requests = await boxRequestService.getBoxRequestsByShopIds(shopIds);
    return res.json(successResponse({ requests }, 200));
  } catch (err) {
    return next(err);
  }
};

export const assignBox = async (req, res, next) => {
  try {
    const { assignedBox } = assignBoxSchema.parse(req.body);
    const { id } = req.params;
    const boxRequest = await boxRequestService.assignBoxToRequest(id, assignedBox);
    return res.json(successResponse({ boxRequest }, 200));
  } catch (err) {
    return next(err);
  }
};