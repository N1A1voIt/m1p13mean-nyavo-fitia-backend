const notificationService = require('../services/notificationService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Controller for Notification endpoints.
 */
exports.getMyNotifications = asyncHandler(async (req, res) => {
    const onlyUnread = req.query.unread === 'true';
    const notifications = await notificationService.getUserNotifications(req.user.id, onlyUnread);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({ success: true, data: { count } });
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notification });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, data: result });
});
