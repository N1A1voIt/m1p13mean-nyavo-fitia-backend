const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number
        },
        buyPrice: {
            type: Number
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    totalBuyAmount: {
        type: Number,
        default: 0
    },
    benefit: {
        type: Number,
        default: 0
    },
    reason: {
        type: String,
        enum: ['Refill', 'Sale', 'Adjustment', 'Return', 'Damage'],
        required: true
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
