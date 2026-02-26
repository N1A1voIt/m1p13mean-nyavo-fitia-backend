import shopService from '../services/shop.service.js';
import { successResponse } from '../utils/response.js';

class ShopController {
    constructor() {
        this.getProducts = this.getProducts.bind(this);
        this.addProduct = this.addProduct.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.processSale = this.processSale.bind(this);
        this.getOrders = this.getOrders.bind(this);
        this.markOrderPickedUp = this.markOrderPickedUp.bind(this);
        this.getMyShops = this.getMyShops.bind(this);
        this.createShop = this.createShop.bind(this);
        this.getMovements = this.getMovements.bind(this);
        this.getAllShops = this.getAllShops.bind(this);
        this.assignBox = this.assignBox.bind(this);
    }

    getShopId(req) {
        const shopId = req.headers['x-shop-id'];
        if (!shopId) {
            const error = new Error('x-shop-id header is required to scope this request');
            error.status = 400;
            throw error;
        }
        return shopId;
    }

    async getMyShops(req, res, next) {
        try {
            const shops = await shopService.getShopsByOwner(req.user.uid);
            res.status(200).json(successResponse(shops));
        } catch (error) {
            next(error);
        }
    }

    async getAllShops(req, res, next) {
        try {
            const shops = await shopService.getAllShops();
            res.status(200).json(successResponse(shops));
        } catch (error) {
            next(error);
        }
    }

    async createShop(req, res, next) {
        try {
            const shop = await shopService.createShop(req.user.uid, req.body);
            res.status(201).json(successResponse(shop, 201));
        } catch (error) {
            next(error);
        }
    }

    async assignBox(req, res, next) {
        try {
            const shop = await shopService.assignBox(req.user.uid, req.params.id, req.body.boxId);
            res.status(200).json(successResponse(shop));
        } catch (error) {
            next(error);
        }
    }

    async getProducts(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const products = await shopService.getProducts(req.user.uid, shopId);
            res.status(200).json(successResponse(products));
        } catch (error) {
            next(error);
        }
    }

    async addProduct(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const product = await shopService.addProduct(req.user.uid, shopId, req.body);
            res.status(201).json(successResponse(product, 201));
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const product = await shopService.updateProduct(req.user.uid, shopId, req.params.id, req.body);
            res.status(200).json(successResponse(product));
        } catch (error) {
            next(error);
        }
    }

    async processSale(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const sale = await shopService.processSale(req.user.uid, shopId, req.body);
            res.status(201).json(successResponse(sale, 201));
        } catch (error) {
            next(error);
        }
    }

    async getOrders(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const orders = await shopService.getOrders(req.user.uid, shopId);
            res.status(200).json(successResponse(orders));
        } catch (error) {
            next(error);
        }
    }

    async getMovements(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const movements = await shopService.getMovements(req.user.uid, shopId);
            res.status(200).json(successResponse(movements));
        } catch (error) {
            next(error);
        }
    }

    async markOrderPickedUp(req, res, next) {
        try {
            const shopId = this.getShopId(req);
            const order = await shopService.markOrderPickedUp(req.user.uid, shopId, req.params.id);
            res.status(200).json(successResponse(order));
        } catch (error) {
            next(error);
        }
    }
}

export default new ShopController();
