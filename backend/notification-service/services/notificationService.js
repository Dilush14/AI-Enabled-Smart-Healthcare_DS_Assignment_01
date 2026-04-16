const Notification = require('../models/Notification');

class NotificationService {
  async getNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async createNotification(payload) {
    const notification = new Notification(payload);
    await notification.save();
    return notification;
  }

  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isSent: true, sentAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new NotificationService();