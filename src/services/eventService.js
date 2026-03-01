const Event = require('../models/Event');

/**
 * Service to handle Mall Events and Communications logic.
 */
class EventService {
    /**
     * Get events within a date range
     */
    async getEvents(start, end) {
        let query = {};
        if (start && end) {
            query = {
                start: { $gte: new Date(start) },
                end: { $lte: new Date(end) }
            };
        }
        return await Event.find(query).sort({ start: 1 });
    }

    /**
     * Create a new event or advertisement
     */
    async createEvent(eventData) {
        return await Event.create(eventData);
    }

    /**
     * Update an event
     */
    async updateEvent(id, updateData) {
        return await Event.findByIdAndUpdate(id, updateData, { new: true });
    }

    /**
     * Get a single event by ID
     */
    async getEventById(id) {
        return await Event.findById(id);
    }

    /**
     * Delete an event
     */
    async deleteEvent(id) {
        return await Event.findByIdAndDelete(id);
    }
}

module.exports = new EventService();
