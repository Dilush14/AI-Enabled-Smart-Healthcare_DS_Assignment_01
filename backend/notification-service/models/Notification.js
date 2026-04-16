const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['appointment_booked', 'appointment_cancelled', 'consultation_completed'], required: true },
  message: { type: String, required: true },
  isSent: { type: Boolean, default: false },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);