const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
    boxNumber: {
        type: String,
        required: [true, 'Box number is required'],
        unique: true,
        trim: true
    },
    location: {
        floor: { type: Number, required: true },
        zone: { type: String, required: true },
        pos: {
            x: { type: Number, default: 30 },
            y: { type: Number, default: 20 }
        }
    },
    type: {
        type: String,
        enum: ['Boutique', 'Kiosque', 'FoodCourt', 'HairSalon'],
        required: true
    },
    status: {
        type: String,
        enum: ['Libre', 'Occupé', 'En travaux'],
        default: 'Libre'
    },
    dimensions: {
        length: { type: Number },
        width: { type: Number }
    },
    pricePerMonth: {
        type: Number,
        required: true
    },
    currentTenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    history: [{
        tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        from: { type: Date },
        to: { type: Date },
        contractUrl: { type: String }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Box', boxSchema);
