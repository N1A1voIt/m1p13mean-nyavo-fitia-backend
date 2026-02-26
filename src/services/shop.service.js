import Shop from '../models/shop.model.js';
import Product from '../models/product.model.js';
import Transaction from '../models/transaction.model.js';
import StockMovement from '../models/stockMovement.model.js';

class ShopService {
    /**
     * Helper to get all shops owned by a user
     */
    async getShopsByOwner(tenantId) {
        return await Shop.find({ tenantId });
    }

    /**
     * Get all shops (public/customer view)
     */
    async getAllShops() {
        return await Shop.find({});
    }

    /**
     * Create a new shop for a user
     */
    async createShop(tenantId, shopData) {
        const { name, shopRef, boxId } = shopData;

        const existing = await Shop.findOne({ shopRef });
        if (existing) {
            const error = new Error('Shop reference already exists');
            error.status = 400;
            throw error;
        }

        return await Shop.create({
            tenantId,
            name,
            shopRef: shopRef || `SHOP-${tenantId.substring(0, 5).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            boxId
        });
    }

    /**
     * Assign a box to a shop manually
     */
    async assignBox(tenantId, shopId, boxId) {
        const shop = await this.verifyOwnership(tenantId, shopId);
        shop.boxId = boxId;
        return await shop.save();
    }

    /**
     * Helper to verify if a user owns a specific shop
     */
    async verifyOwnership(tenantId, shopId) {
        const shop = await Shop.findOne({ _id: shopId, tenantId });
        if (!shop) {
            const error = new Error('Shop not found or you do not have permission to access it');
            error.status = 403;
            throw error;
        }
        return shop;
    }

    /**
     * Helper to record stock movement
     */
    async recordMovement(shopId, type, performedBy, items, sourceId = null) {
        const mvtRef = `MVT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        return await StockMovement.create({
            mvtRef,
            shopId,
            type,
            performedBy,
            items,
            sourceId
        });
    }

    /**
     * Inventory Methods
     */
    async getProducts(tenantId, shopId) {
        await this.verifyOwnership(tenantId, shopId);
        return await Product.find({ shopId });
    }

    async addProduct(tenantId, shopId, productData) {
        await this.verifyOwnership(tenantId, shopId);
        const product = await Product.create({
            ...productData,
            shopId
        });

        // Record restock movement
        await this.recordMovement(shopId, 'IN', tenantId, [{
            productId: product._id,
            quantity: product.quantity,
            price: product.price,
            reason: 'Initial stock'
        }]);

        return product;
    }

    async updateProduct(tenantId, shopId, productId, updateData) {
        await this.verifyOwnership(tenantId, shopId);

        const oldProduct = await Product.findOne({ _id: productId, shopId });
        if (!oldProduct) throw new Error('Product not found');

        const product = await Product.findOneAndUpdate(
            { _id: productId, shopId },
            updateData,
            { new: true }
        );

        // Record movement if quantity changed
        if (updateData.quantity !== undefined && updateData.quantity !== oldProduct.quantity) {
            const diff = product.quantity - oldProduct.quantity;
            await this.recordMovement(shopId, 'ADJUSTMENT', tenantId, [{
                productId: product._id,
                quantity: diff,
                price: product.price,
                reason: 'Manual adjustment'
            }]);
        }

        return product;
    }

    /**
     * POS / Sale Methods
     */
    async processSale(tenantId, shopId, saleData) {
        await this.verifyOwnership(tenantId, shopId);
        const { items } = saleData;

        let totalAmount = 0;
        const processedItems = [];
        const movementItems = [];

        for (const item of items) {
            const product = await Product.findOne({ _id: item.productId, shopId });
            if (!product || product.quantity < item.quantity) {
                const error = new Error(`Insufficient stock for ${product?.name || 'product'}`);
                error.status = 400;
                throw error;
            }

            product.quantity -= item.quantity;
            await product.save();

            totalAmount += product.price * item.quantity;
            processedItems.push({
                productId: product._id,
                quantity: item.quantity,
                priceAtSale: product.price,
                name: product.name
            });

            movementItems.push({
                productId: product._id,
                quantity: -item.quantity,
                price: product.price,
                reason: 'POS Sale'
            });
        }

        const transaction = await Transaction.create({
            shopId,
            type: 'SALE',
            items: processedItems,
            totalAmount,
            status: 'COMPLETED'
        });

        // Record stock movement
        await this.recordMovement(shopId, 'OUT', tenantId, movementItems, transaction._id.toString());

        return transaction;
    }

    /**
     * Orders Methods
     */
    async getOrders(tenantId, shopId) {
        await this.verifyOwnership(tenantId, shopId);
        return await Transaction.find({ shopId, type: 'ORDER' })
            .sort({ createdAt: -1 });
    }

    async getMovements(tenantId, shopId) {
        await this.verifyOwnership(tenantId, shopId);
        return await StockMovement.find({ shopId })
            .populate('items.productId')
            .sort({ createdAt: -1 });
    }

    async markOrderPickedUp(tenantId, shopId, orderId) {
        await this.verifyOwnership(tenantId, shopId);
        const order = await Transaction.findOneAndUpdate(
            { _id: orderId, shopId, type: 'ORDER' },
            { status: 'PICKED_UP' },
            { new: true }
        );
        if (!order) {
            const error = new Error('Order not found in this shop');
            error.status = 404;
            throw error;
        }
        return order;
    }
}

export default new ShopService();
