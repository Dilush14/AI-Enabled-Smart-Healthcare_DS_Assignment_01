const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  role: { type: String, required: true },
  specialization: { type: String },
  phone: { type: String },
  address: { type: String },
  profilePhotoUrl: { type: String },
  isVerified: { type: Boolean, default: false },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalPatients: { type: Number, default: 0 },
  clinicName: { type: String, default: '' },
  clinicAddress: { type: String, default: '' },
  idProofUrl: { type: String, default: '' },
  availability: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'users' });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);