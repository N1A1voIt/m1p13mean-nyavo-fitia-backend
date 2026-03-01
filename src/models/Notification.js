const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'RentDue',
            'RentLate',
            'RentGenerated',
            'PaymentReceived',
            'ContractExpiring',
            'OrderStatus',
            'General'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        // Flexible field for linking to related entities
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
        boxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Box' },
        contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient user notification queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
