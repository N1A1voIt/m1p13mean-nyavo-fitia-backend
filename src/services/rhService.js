const StaffPlanning = require('../models/StaffPlanning');

/**
 * Service to handle RH and Staff planning logic.
 */
class RHService {
    /**
     * Get planning for a specific team or all staff
     */
    async getPlanning(filters = {}) {
        return await StaffPlanning.find(filters).populate('userId');
    }

    /**
     * Create or update a staff shift
     */
    async updateShifts(staffId, newShifts) {
        let planning = await StaffPlanning.findOne({ userId: staffId });

        if (!planning) {
            // Get user team from User model if needed, here we assume it's passed or default
            planning = await StaffPlanning.create({
                userId: staffId,
                team: 'Security', // Default for demo
                shifts: newShifts
            });
        } else {
            planning.shifts = newShifts;
            await planning.save();
        }

        return planning;
    }

    /**
     * Clock in/out for attendance
     */
    async recordAttendance(userId, type, location = {}) {
        const planning = await StaffPlanning.findOne({ userId });
        if (!planning) {
            const error = new Error('Staff planning record not found');
            error.statusCode = 404;
            throw error;
        }

        const today = new Date().setHours(0, 0, 0, 0);
        let attendanceRecord = planning.attendance.find(a => new Date(a.date).setHours(0, 0, 0, 0) === today);

        if (!attendanceRecord) {
            attendanceRecord = { date: new Date(), clockIn: null, clockOut: null, location };
            planning.attendance.push(attendanceRecord);
            attendanceRecord = planning.attendance[planning.attendance.length - 1];
        }

        if (type === 'in') {
            attendanceRecord.clockIn = new Date();
        } else {
            attendanceRecord.clockOut = new Date();
        }

        await planning.save();
        return planning;
    }
}

module.exports = new RHService();
