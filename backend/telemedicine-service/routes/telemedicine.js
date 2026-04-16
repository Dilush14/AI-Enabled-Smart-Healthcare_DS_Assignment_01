const express = require('express');
const { 
  createSession, 
  getSession,
  getSessionByAppointment,
  updateSessionStatus,
  endSession,
  uploadReport,
  getReports,
  getReportById,
  addDoctorNotes,
  getSessionReports,
  getPatientReports
} = require('../controllers/telemedicineController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Session routes
router.post('/create-session', auth, createSession);
router.get('/session/:id', auth, getSession);
router.get('/session/appointment/:appointmentId', auth, getSessionByAppointment);
router.put('/session/:id/status', auth, updateSessionStatus);
router.put('/session/:id/end', auth, endSession);

// Report routes
router.post('/report/upload', auth, upload.single('file'), uploadReport);
router.get('/reports', auth, getReports);
router.get('/report/:id', auth, getReportById);
router.put('/report/:id/notes', auth, addDoctorNotes);
router.get('/session/:id/reports', auth, getSessionReports);
router.get('/patient/reports', auth, getPatientReports);

module.exports = router;