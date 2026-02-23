const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    boxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: [true, 'Box reference is required']
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Tenant reference is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Lease start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'Lease end date is required']
    },
    monthlyRent: {
        type: Number,
        required: [true, 'Monthly rent amount is required']
    },
    depositAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Terminated', 'Pending'],
        default: 'Active'
    },
    terms: {
        type: String,
        default: ''
    },
    contractUrl: {
        type: String,
        default: ''
    },
    renewalNotice: {
        // Days before endDate to notify about renewal
        type: Number,
        default: 30
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient lookups
contractSchema.index({ boxId: 1, status: 1 });
contractSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
