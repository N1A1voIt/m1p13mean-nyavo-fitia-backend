const Order = require('../models/Order');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const loyaltyService = require('./loyaltyService');

/**
 * Service to handle Web Orders and Click & Collect logic.
 */
class OrderService {
    /**
     * Get orders using a flexible filter object
     */
    async getOrders(filter = {}) {
        return await Order.find(filter).populate('clientId').populate('shopId').sort({ createdAt: -1 });
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId).populate('clientId').populate('shopId');
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }
        return order;
    }

    /**
     * Create a new web order
     */
    async createOrder(orderData) {
        if (!orderData.description) {
            orderData.description = `Digital Order containing ${orderData.items.length} item(s)`;
        }
        return await Order.create(orderData);
    }

    /**
     * Update order status
     */
    async updateStatus(orderId, status) {
        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        order.status = status;
        await order.save();
        return order;
    }

    /**
     * Mark as collected and finalize stock
     * Only reduces stock if not already collected (guard against double-decrement)
     */
    async markAsCollected(orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Guard: only reduce stock if not already collected
        if (order.status === 'Collected') {
            const error = new Error('Order is already collected');
            error.statusCode = 400;
            throw error;
        }

        order.status = 'Collected';
        order.paymentStatus = 'Paid';

        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        await StockMovement.create({
            shopId: order.shopId,
            date: new Date(),
            description: `Click & Collect Order ${orderId}`,
            type: 'OUT',
            reason: 'Sale',
            notes: `Validation of Order ${orderId}`,
            totalAmount: order.totalAmount,
            items: order.items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });
        
        // Award loyalty points (1 point per 1000 MGA, example rule)
        if (order.clientId) {
            const points = Math.floor(order.totalAmount / 1000);
            if (points > 0) {
                await loyaltyService.addPoints(order.clientId, points, `Click & Collect Order ${orderId}`);
            }
        }

        await order.save();
        return order;
    }
}

module.exports = new OrderService();
