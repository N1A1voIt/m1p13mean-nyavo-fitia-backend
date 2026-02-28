const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['Ad', 'Event', 'Promo'],
        required: true
    },
    category: {
        type: String, // e.g., 'Digital Screen', 'Podium', 'Holiday'
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    location: {
        type: String // e.g., 'Aile Nord', 'Main Entrance'
    },
    status: {
        type: String,
        enum: ['Draft', 'Confirmed', 'Live', 'Ended'],
        default: 'Confirmed'
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
