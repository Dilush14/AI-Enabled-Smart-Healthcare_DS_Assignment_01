const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId },
  meetingLink: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  startTime: { type: Date },
  endTime: { type: Date },
  recordingUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);