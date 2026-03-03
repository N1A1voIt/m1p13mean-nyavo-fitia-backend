const Sale = require('../models/Sale');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const mongoose = require('mongoose');
const loyaltyService = require('./loyaltyService');
const Loyalty = require('../models/Loyalty');

/**
 * Service to handle Shop Sales and POS logic.
 */
class SaleService {
    /**
     * Process a new sale
     */
    async processSale(saleData) {
        const { shopId, items, paymentMethod, totalAmount, sellerId, clientId, loyaltyCode } = saleData;

        // 1. Fetch Product buyPrices to calculate benefits
        let totalBuyAmount = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            const buyPrice = product?.buyPrice || 0;
            const itemTotalBuy = buyPrice * item.quantity;
            totalBuyAmount += itemTotalBuy;

            enrichedItems.push({
                ...item,
                buyPrice: buyPrice
            });
        }

        // 1. Create Sale Record
        const sale = await Sale.create({
            shopId,
            items: enrichedItems,
            paymentMethod,
            totalAmount,
            totalBuyAmount,
            benefit: totalAmount - totalBuyAmount,
            sellerId,
            clientId
        });

        // 2. Update Stock Levels
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        await StockMovement.create({
            shopId: shopId,
            date: new Date(),
            description: `POS Sale ${sale._id}`,
            type: 'OUT',
            reason: 'Sale',
            notes: `Physical register sale`,
            totalAmount: totalAmount,
            items: enrichedItems.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                buyPrice: item.buyPrice,
                quantity: item.quantity
            }))
        });
        
        // Award loyalty points
        let clientUserId = clientId;
        if (!clientUserId && loyaltyCode) {
            const loyaltyRecord = await Loyalty.findOne({ qrCode: loyaltyCode });
            if (loyaltyRecord) {
                clientUserId = loyaltyRecord.userId;
                // Update sale to link client
                sale.clientId = clientUserId;
                await sale.save();
            }
        }
        if (clientUserId) {
            const points = Math.floor(totalAmount / 1000);
            if (points > 0) {
                await loyaltyService.addPoints(clientUserId, points, `POS Sale ${sale._id}`);
            }
        }

        return sale;
    }

    /**
     * Get sales history for a shop
     */
    async getSalesHistory(shopId, filters = {}) {
        return await Sale.find({ shopId, ...filters }).sort({ createdAt: -1 });
    }

    /**
     * Get sales stats for a shop
     */
    async getShopSalesStats(shopId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyTotal = await Sale.aggregate([
            { $match: { shopId: new mongoose.Types.ObjectId(shopId), createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            todayRevenue: dailyTotal[0]?.total || 0,
            // Add more stats as needed
        };
    }
}

module.exports = new SaleService();
