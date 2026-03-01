const Invoice = require('../models/Invoice');
const Box = require('../models/Box');
const notificationService = require('./notificationService');

/**
 * Service to handle Billing and Invoice logic.
 */
class BillingService {
    /**
     * Get all invoices with optional filters
     */
    async getAllInvoices(filters = {}) {
        return await Invoice.find(filters).populate('tenantId').populate('boxId');
    }

    /**
     * Get invoices for a specific tenant (boutique user)
     */
    async getTenantInvoices(tenantId, filters = {}) {
        const query = { tenantId, ...filters };
        return await Invoice.find(query).populate('boxId').sort({ createdAt: -1 });
    }

    /**
     * Get a single invoice by ID
     */
    async getInvoiceById(id) {
        const invoice = await Invoice.findById(id).populate('tenantId').populate('boxId');
        if (!invoice) {
            const error = new Error('Invoice not found');
            error.statusCode = 404;
            throw error;
        }
        return invoice;
    }

    /**
     * Generate monthly rent invoices for all occupied boxes
     */
    async generateMonthlyRent() {
        const occupiedBoxes = await Box.find({ status: 'Occupé' }).populate('currentTenant');
        const invoices = [];

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5); // 5 days from now

        for (const box of occupiedBoxes) {
            if (!box.currentTenant) continue;

            // Check if already generated for this month
            const existing = await Invoice.findOne({
                boxId: box._id,
                type: 'Loyer',
                createdAt: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            });

            if (existing) continue;

            const invoice = await Invoice.create({
                invoiceNumber: `INV-${year}-${String(month).padStart(2, '0')}-${box.boxNumber}`,
                tenantId: box.currentTenant._id,
                boxId: box._id,
                amount: box.pricePerMonth,
                type: 'Loyer',
                dueDate: dueDate
            });

            invoices.push(invoice);
        }

        // Notify all tenants about their new invoices
        if (invoices.length > 0) {
            await notificationService.notifyRentGenerated(invoices);
        }

        return invoices;
    }

    /**
     * Mark an invoice as paid
     */
    async payInvoice(id, paymentData) {
        const { method, transactionId } = paymentData;
        const invoice = await Invoice.findByIdAndUpdate(id, {
            status: 'Paid',
            'paymentDetails.method': method,
            'paymentDetails.transactionId': transactionId,
            'paymentDetails.paidAt': new Date()
        }, { new: true });

        if (!invoice) {
            const error = new Error('Invoice not found');
            error.statusCode = 404;
            throw error;
        }

        // Notify tenant of payment confirmation
        await notificationService.createNotification({
            userId: invoice.tenantId,
            type: 'PaymentReceived',
            title: '✅ Payment Confirmed',
            message: `Payment of ${invoice.amount.toLocaleString()} MGA for invoice ${invoice.invoiceNumber} has been received.`,
            metadata: { invoiceId: invoice._id, boxId: invoice.boxId }
        });

        return invoice;
    }

    /**
     * Auto-detect and mark late invoices (called by cron job)
     */
    async markLateInvoices() {
        const now = new Date();
        const lateInvoices = await Invoice.find({
            status: 'Pending',
            dueDate: { $lt: now }
        });

        if (lateInvoices.length === 0) return [];

        // Mark them as Late
        const ids = lateInvoices.map(i => i._id);
        await Invoice.updateMany(
            { _id: { $in: ids } },
            { status: 'Late' }
        );

        // Notify tenants
        await notificationService.notifyLateInvoices(lateInvoices);

        return lateInvoices;
    }

    /**
     * Get billing summary for a tenant
     */
    async getTenantBillingSummary(tenantId) {
        const invoices = await Invoice.find({ tenantId });
        const totalDue = invoices
            .filter(i => i.status === 'Pending' || i.status === 'Late')
            .reduce((sum, i) => sum + i.amount, 0);
        const totalPaid = invoices
            .filter(i => i.status === 'Paid')
            .reduce((sum, i) => sum + i.amount, 0);
        const lateCount = invoices.filter(i => i.status === 'Late').length;
        const nextDue = invoices
            .filter(i => i.status === 'Pending')
            .sort((a, b) => a.dueDate - b.dueDate)[0];

        return {
            totalDue,
            totalPaid,
            lateCount,
            invoiceCount: invoices.length,
            nextDueDate: nextDue?.dueDate || null,
            nextDueAmount: nextDue?.amount || 0
        };
    }
}

module.exports = new BillingService();
