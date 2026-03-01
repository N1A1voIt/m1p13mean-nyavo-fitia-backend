const mongoose = require('mongoose');

const utilityReadingSchema = new mongoose.Schema({
    boxId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    },
    type: {
        type: String,
        enum: ['Electric', 'Water'],
        required: true
    },
    meterId: {
        type: String,
        required: true
    },
    previousIndex: {
        type: Number,
        required: true
    },
    currentIndex: {
        type: Number,
        required: true
    },
    consumption: {
        type: Number,
        required: true
    },
    readingDate: {
        type: Date,
        default: Date.now
    },
    invoiceStatus: {
        type: String,
        enum: ['Pending', 'Invoiced'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('UtilityReading', utilityReadingSchema);
