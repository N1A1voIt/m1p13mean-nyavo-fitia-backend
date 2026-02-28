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

        product.stock += quantity;
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

        // Update product stock
        if (type === 'IN') {
            product.stock += numericQty;
        } else if (type === 'OUT') {
            product.stock -= numericQty;
            if (product.stock < 0) product.stock = 0; // Prevent negative stock depending on rules
        }

        await product.save();
        
        return { movement, product };
    }
}

module.exports = new ShopERPService();
