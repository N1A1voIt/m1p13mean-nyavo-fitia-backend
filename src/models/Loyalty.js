const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    history: [{
        date: { type: Date, default: Date.now },
        points: { type: Number },
        type: { type: String, enum: ['Earned', 'Redeemed'] },
        description: { type: String }
    }],
    qrCode: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Loyalty', loyaltySchema);
