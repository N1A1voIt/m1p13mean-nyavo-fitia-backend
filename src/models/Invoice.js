const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    boxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Loyer', 'Charge_Jiro', 'Charge_Rano', 'Pub'],
        default: 'Loyer'
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Late', 'Canceled'],
        default: 'Pending'
    },
    paymentDetails: {
        method: { type: String },
        transactionId: { type: String },
        paidAt: { type: Date }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
