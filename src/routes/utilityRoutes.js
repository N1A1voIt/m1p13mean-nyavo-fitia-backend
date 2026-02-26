const express = require('express');
const router = express.Router();
const {
    addReading,
    getReadings,
    generateInvoices
} = require('../controllers/utilityController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.post('/readings', addReading);
router.get('/readings/:boxId', getReadings);
router.post('/generate-invoices', generateInvoices);

module.exports = router;
