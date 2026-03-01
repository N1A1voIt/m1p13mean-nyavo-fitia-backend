const express = require('express');
const router = express.Router();
const {
    getInvoices,
    getInvoiceById,
    generateRent,
    payInvoice,
    markLateInvoices,
    getMyInvoices,
    getMyBillingSummary
} = require('../controllers/billingController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// ===== Boutique (shop owner) endpoints - must be before admin-only middleware =====
router.get('/my-invoices', authorize('boutique'), getMyInvoices);
router.get('/my-summary', authorize('boutique'), getMyBillingSummary);

// ===== Admin endpoints =====
router.route('/')
    .get(authorize('admin'), getInvoices)
    .post(authorize('admin'), generateRent);

router.get('/:id', authorize('admin', 'boutique'), getInvoiceById);
router.patch('/:id/pay', authorize('admin'), payInvoice);
router.post('/mark-late', authorize('admin'), markLateInvoices);

module.exports = router;
