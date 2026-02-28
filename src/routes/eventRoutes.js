const express = require('express');
const router = express.Router();
const {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getEventMeta
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/meta', getEventMeta);

router.route('/')
    .get(getEvents)
    .post(createEvent);

router.route('/:id')
    .get(getEvent)
    .patch(updateEvent)
    .delete(deleteEvent);

module.exports = router;
