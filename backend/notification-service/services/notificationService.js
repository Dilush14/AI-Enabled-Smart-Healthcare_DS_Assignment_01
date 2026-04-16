const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId, { unreadOnly = false } = {}) {
    const query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    return Notification.find(query).sort({ createdAt: -1 });
  }

  async createNotification(payload) {
    const { userId, title, type, message, metadata = {}, isRead = false } = payload || {};

    if (!userId || !title || !type || !message) {
      throw new Error('userId, title, type, and message are required');
    }

    return Notification.create({
      userId,
      title,
      type,
      message,
      metadata,
      isRead,
      readAt: isRead ? new Date() : undefined,
    });
  }

  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ userId, isRead: false });
  }
}

module.exports = new NotificationService();