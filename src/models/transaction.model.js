import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['SALE', 'ORDER'], // SALE = POS, ORDER = Web Click & Collect
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        priceAtSale: {
            type: Number,
            required: true
        },
        name: String // Snapshot of product name
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'PICKED_UP', 'CANCELLED'],
        default: 'PENDING'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
