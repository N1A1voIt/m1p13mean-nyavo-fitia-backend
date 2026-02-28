const eventService = require('../services/eventService');
const asyncHandler = require('../middleware/asyncHandler');
const Event = require('../models/Event');

// Default fallbacks used when DB has no values yet
const DEFAULT_CATEGORIES = [
    'Digital Screen', 'Podium / Stage', 'Holiday', 'Brand Activation',
    'Seasonal Promo', 'Community', 'Sport', 'Music', 'Art & Culture'
];
const DEFAULT_LOCATIONS = [
    'Main Hall', 'Food Court', 'Food Terrace', 'Gallery',
    'Kids Zone', 'Parking', 'Main Entrance', 'Escalators Area', 'External Facade'
];

exports.getEventMeta = asyncHandler(async (req, res) => {
    let [categories, locations] = await Promise.all([
        Event.distinct('category'),
        Event.distinct('location')
    ]);
    // Merge defaults for any missing values
    categories = [...new Set([...DEFAULT_CATEGORIES, ...categories.filter(Boolean)])];
    locations  = [...new Set([...DEFAULT_LOCATIONS,  ...locations.filter(Boolean)])];
    res.status(200).json({ success: true, data: { categories, locations } });
});

/**
 * Controller for Comms and Events requests.
 */
exports.getEvents = asyncHandler(async (req, res) => {
    const { start, end } = req.query;
    const events = await eventService.getEvents(start, end);
    res.status(200).json({ success: true, count: events.length, data: events });
});

exports.createEvent = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
});

exports.getEvent = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, data: event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id);
    res.status(200).json({ success: true, data: {} });
});
