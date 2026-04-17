const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, default: '' },
  idProofUrl: { type: String },
  about: { type: String, default: '' },
  clinicName: { type: String, default: '' },
  clinicAddress: { type: String, default: '' },
  experience: { type: Number },
  totalPatients: { type: Number, default: 0 },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratings: [{
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  }],
  availability: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    startTime: { type: String },
    endTime: { type: String }
  }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);