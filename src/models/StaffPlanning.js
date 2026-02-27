const mongoose = require('mongoose');

const staffPlanningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: {
        type: String,
        enum: ['Security', 'Maintenance', 'Admin'],
        required: true
    },
    shifts: [{
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        zone: { type: String, required: true }
    }],
    status: {
        type: String,
        enum: ['Active', 'OnLeave'],
        default: 'Active'
    },
    attendance: [{
        date: { type: Date },
        clockIn: { type: Date },
        clockOut: { type: Date },
        location: { lat: Number, lng: Number }
    }]
});

module.exports = mongoose.model('StaffPlanning', staffPlanningSchema);
