const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * Service to handle Boutique ERP (Stock, Inventory) logic.
 */
class ShopERPService {
    /**
     * Get all products for a shop
     */
    async getProducts(shopId, filters = {}) {
        return await Product.find({ shopId, ...filters });
    }

    /**
     * Create a new product
     */
    async addProduct(productData) {
        return await Product.create(productData);
    }

    /**
     * Update product details or stock
     */
    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true });
    }

    /**
     * Decrease stock on sale
     */
    async adjustStock(productId, quantity) {
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');

        const newStock = product.stock + quantity;
        if (newStock < 0) {
            throw new Error(`Insufficient stock for ${product.name}. Current stock: ${product.stock}, requested adjustment: ${quantity}`);
        }

        product.stock = newStock;
        await product.save();
        return product;
    }

    /**
     * Delete product
     */
    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    /**
     * Get stock movements for a shop
     */
    async getStockMovements(shopId) {
        return await StockMovement.find({ shopId })
            .populate('items.productId', 'name sku')
            .sort({ createdAt: -1 });
    }

    /**
     * Record a stock movement
     */
    async recordStockMovement(data) {
        const { shopId, productId, type, quantity, reason, notes } = data;

        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.shopId.toString() !== shopId.toString()) {
            throw new Error('Unauthorized');
        }

        const numericQty = parseInt(quantity, 10);
        
        // Update product stock validation before movement
        if (type === 'OUT') {
            if (product.stock < numericQty) {
                throw new Error(`Insufficient stock for ${product.name}. Current stock: ${product.stock}, requested: ${numericQty}`);
            }
            product.stock -= numericQty;
        } else if (type === 'IN') {
            product.stock += numericQty;
        }

        // Create movement record (Mother Container containing items as children)
        const movement = await StockMovement.create({
            shopId,
            date: new Date(),
            description: `Manual ${type} entry for ${product.name}`,
            type,
            reason,
            notes,
            totalAmount: numericQty * (product.price || 0),
            items: [{
                productId,
                name: product.name,
                price: product.price,
                quantity: numericQty
            }]
        });

        await product.save();
        
        return { movement, product };
    }
}

module.exports = new ShopERPService();
