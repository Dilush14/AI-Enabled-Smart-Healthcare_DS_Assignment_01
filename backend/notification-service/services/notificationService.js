const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

const APPOINTMENT_EMAIL_TYPES = new Set(['appointment_accepted', 'appointment_cancelled']);

class NotificationService {
  async getUserEmail(userId) {
    const usersCollection = mongoose.connection?.db?.collection('users');
    if (!usersCollection || !userId) {
      return null;
    }

    const lookupId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const user = await usersCollection.findOne({ _id: lookupId }, { projection: { email: 1, name: 1 } });
    return user || null;
  }

  buildAppointmentEmailContent(notification, recipientUser) {
    const metadata = notification?.metadata || {};
    const appointmentLabel = metadata.appointmentLabel || 'your appointment';
    const doctorName = metadata.doctorName || 'Doctor';
    const patientName = metadata.patientName || 'Patient';

    if (notification.type === 'appointment_accepted') {
      return {
        subject: `Appointment accepted - ${appointmentLabel}`,
        text: [
          `Hello ${recipientUser?.name || ''},`,
          '',
          `Your appointment ${appointmentLabel} has been accepted.`,
          `Doctor: ${doctorName}`,
          '',
          'Please log in to continue with the next step.',
        ].join('\n'),
        html: `
          <p>Hello ${recipientUser?.name || ''},</p>
          <p>Your appointment <strong>${appointmentLabel}</strong> has been accepted.</p>
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p>Please log in to continue with the next step.</p>
        `,
      };
    }

    return {
      subject: `Appointment cancelled - ${appointmentLabel}`,
      text: [
        `Hello ${recipientUser?.name || ''},`,
        '',
        `Your appointment ${appointmentLabel} has been cancelled.`,
        `Doctor: ${doctorName}`,
        `Patient: ${patientName}`,
      ].join('\n'),
      html: `
        <p>Hello ${recipientUser?.name || ''},</p>
        <p>Your appointment <strong>${appointmentLabel}</strong> has been cancelled.</p>
        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Patient:</strong> ${patientName}</p>
      `,
    };
  }

  async maybeSendAppointmentEmail(notification) {
    if (!APPOINTMENT_EMAIL_TYPES.has(notification?.type)) {
      return;
    }

    const recipientUser = await this.getUserEmail(notification.userId);
    if (!recipientUser?.email) {
      return;
    }

    const { subject, text, html } = this.buildAppointmentEmailContent(notification, recipientUser);
    await emailService.sendAppointmentStatusEmail({
      to: recipientUser.email,
      subject,
      text,
      html,
    });
  }

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

    const notification = await Notification.create({
      userId,
      title,
      type,
      message,
      metadata,
      isRead,
      readAt: isRead ? new Date() : undefined,
    });

    try {
      await this.maybeSendAppointmentEmail(notification);
    } catch (error) {
      console.error('Appointment email dispatch failed:', error.message);
    }

    return notification;
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