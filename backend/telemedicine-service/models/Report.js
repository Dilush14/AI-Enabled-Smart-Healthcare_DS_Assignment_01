const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  
  // File information
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image', 'document'], required: true },
  
  // Report details
  reportType: { 
    type: String, 
    enum: ['lab_report', 'x_ray', 'ct_scan', 'ultrasound', 'blood_test', 'general'], 
    default: 'general',
    required: true 
  },
  
  // AI Analysis
  aiAnalysis: {
    summary: { type: String },
    keyFindings: [{ type: String }],
    riskFactors: [{ type: String }],
    suggestions: [{ type: String }],
    dailyHabits: {
      diet: [{ type: String }],
      exercise: [{ type: String }],
      sleep: [{ type: String }],
      lifestyle: [{ type: String }],
      medications: [{ type: String }],
    },
    confidenceScore: { type: Number, min: 0, max: 100 },
    analyzedAt: { type: Date },
  },
  
  // Doctor notes
  doctorNotes: { type: String },
  doctorRecommendations: [{ type: String }],
  
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
