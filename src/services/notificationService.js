const Notification = require('../models/Notification');
const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');

/**
 * Service to handle Notification logic.
 */
class NotificationService {
    /**
     * Create a notification
     */
    async createNotification({ userId, type, title, message, metadata = {} }) {
        return await Notification.create({ userId, type, title, message, metadata });
    }

    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId, onlyUnread = false) {
        const filter = { userId };
        if (onlyUnread) filter.read = false;
        return await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId) {
        return await Notification.countDocuments({ userId, read: false });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );
        if (!notification) {
            const error = new Error('Notification not found');
            error.statusCode = 404;
            throw error;
        }
        return notification;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        await Notification.updateMany({ userId, read: false }, { read: true });
        return { message: 'All notifications marked as read' };
    }

    /**
     * Notify tenants about newly generated rent invoices
     */
    async notifyRentGenerated(invoices) {
        const notifications = [];
        for (const invoice of invoices) {
            const populatedInvoice = await Invoice.findById(invoice._id).populate('boxId');
            if (!populatedInvoice) continue;

            const n = await this.createNotification({
                userId: invoice.tenantId,
                type: 'RentGenerated',
                title: 'New Rent Invoice',
                message: `Your monthly rent invoice of ${invoice.amount.toLocaleString()} MGA for Box ${populatedInvoice.boxId?.boxNumber || 'N/A'} is due on ${new Date(invoice.dueDate).toLocaleDateString()}.`,
                metadata: {
                    invoiceId: invoice._id,
                    boxId: invoice.boxId
                }
            });
            notifications.push(n);
        }
        return notifications;
    }

    /**
     * Notify tenants about late invoices
     */
    async notifyLateInvoices(invoices) {
        const notifications = [];
        for (const invoice of invoices) {
            const n = await this.createNotification({
                userId: invoice.tenantId,
                type: 'RentLate',
                title: '⚠️ Overdue Payment',
                message: `Your invoice ${invoice.invoiceNumber} of ${invoice.amount.toLocaleString()} MGA is overdue. Please settle payment immediately.`,
                metadata: {
                    invoiceId: invoice._id,
                    boxId: invoice.boxId
                }
            });
            notifications.push(n);
        }
        return notifications;
    }

    /**
     * Notify about contract expiring soon
     */
    async checkAndNotifyExpiringContracts() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringContracts = await Contract.find({
            status: 'Active',
            endDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
        }).populate('boxId');

        const notifications = [];
        for (const contract of expiringContracts) {
            // Avoid duplicate notifications: check if one was already sent this week
            const recentNotification = await Notification.findOne({
                userId: contract.tenantId,
                type: 'ContractExpiring',
                'metadata.contractId': contract._id,
                createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
            });
            if (recentNotification) continue;

            const daysLeft = Math.ceil((contract.endDate - new Date()) / (1000 * 60 * 60 * 24));
            const n = await this.createNotification({
                userId: contract.tenantId,
                type: 'ContractExpiring',
                title: '📋 Contract Expiring Soon',
                message: `Your lease for Box ${contract.boxId?.boxNumber || 'N/A'} expires in ${daysLeft} days (${new Date(contract.endDate).toLocaleDateString()}). Contact admin for renewal.`,
                metadata: {
                    contractId: contract._id,
                    boxId: contract.boxId?._id
                }
            });
            notifications.push(n);
        }
        return notifications;
    }
}

module.exports = new NotificationService();
