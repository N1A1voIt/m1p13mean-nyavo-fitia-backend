const billingService = require('../services/billingService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Billing related requests.
 */

// ===== Admin endpoints =====

exports.getInvoices = asyncHandler(async (req, res) => {
    const invoices = await billingService.getAllInvoices(req.query);
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
});

exports.getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await billingService.getInvoiceById(req.params.id);
    res.status(200).json({ success: true, data: invoice });
});

exports.generateRent = asyncHandler(async (req, res) => {
    const invoices = await billingService.generateMonthlyRent();
    res.status(201).json({ success: true, count: invoices.length, data: invoices });
});

exports.payInvoice = asyncHandler(async (req, res) => {
    const invoice = await billingService.payInvoice(req.params.id, req.body);
    res.status(200).json({ success: true, data: invoice });
});

exports.markLateInvoices = asyncHandler(async (req, res) => {
    const lateInvoices = await billingService.markLateInvoices();
    res.status(200).json({ success: true, count: lateInvoices.length, data: lateInvoices });
});

// ===== Boutique (shop owner) endpoints =====

exports.getMyInvoices = asyncHandler(async (req, res) => {
    const invoices = await billingService.getTenantInvoices(req.user.id, req.query);
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
});

exports.getMyBillingSummary = asyncHandler(async (req, res) => {
    const summary = await billingService.getTenantBillingSummary(req.user.id);
    res.status(200).json({ success: true, data: summary });
});
