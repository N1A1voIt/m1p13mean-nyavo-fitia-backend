const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String, // e.g., "14:00"
        required: true
    },
    serviceType: {
        type: String,
        enum: ['FoodCourtTable', 'HairSalonSlot'],
        required: true
    },
    numberOfPeople: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Canceled'],
        default: 'Pending'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);
