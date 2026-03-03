const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        buyPrice: { type: Number },
        total: { type: Number, required: true }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    totalBuyAmount: {
        type: Number
    },
    benefit: {
        type: Number
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'MobileMoney', 'Card'],
        default: 'Cash'
    },
    status: {
        type: String,
        enum: ['Completed', 'Refunded'],
        default: 'Completed'
    },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sale', saleSchema);
