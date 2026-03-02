const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartService {
    async getCart(userId) {
        let cart = await Cart.findOne({ userId }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        return cart;
    }

    async updateCart(userId, items) {
        // Enforce stock check before saving to cart
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }
            if (!product.active) {
                throw new Error(`${product.name} is currently not available for purchase`);
            }
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        cart.items = items;
        cart.updatedAt = Date.now();
        await cart.save();
        return await this.getCart(userId); // Re-fetch to populate the product details
    }

    async clearCart(userId) {
        let cart = await Cart.findOne({ userId });
        if (cart) {
            cart.items = [];
            cart.updatedAt = Date.now();
            await cart.save();
        }
        return cart;
    }
}

module.exports = new CartService();
