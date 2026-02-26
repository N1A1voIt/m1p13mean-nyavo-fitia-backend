import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
    mvtRef: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT', 'RESERVE', 'UNRESERVE', 'ADJUSTMENT'],
        required: true
    },
    sourceId: {
        type: String, // ID of Order or Sale
        index: true
    },
    performedBy: {
        type: String, // Firebase UID
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
            required: true
        },
        price: Number,
        reason: String
    }]
}, {
    timestamps: true
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
