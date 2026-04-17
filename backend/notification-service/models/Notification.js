const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'appointment_booked',
      'appointment_accepted',
      'appointment_cancelled',
      'appointment_completed',
      'payment_completed',
      'payment_failed',
      'consultation_completed',
      'session_created',
      'session_started',
      'session_ended',
      'report_uploaded',
      'doctor_notes_added',
      'ai_suggestions_ready'
    ],
    required: true
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);