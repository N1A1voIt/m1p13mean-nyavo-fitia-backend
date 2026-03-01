const Cart = require('../models/Cart');

class CartService {
    async getCart(userId) {
        let cart = await Cart.findOne({ userId }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        return cart;
    }

    async updateCart(userId, items) {
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
