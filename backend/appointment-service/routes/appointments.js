const express = require('express');
const {
	getAppointments,
	bookAppointment,
	cancelAppointment,
	searchDoctors,
	updateAppointmentStatus,
	getAvailableSlots,
	getAppointmentById
} = require('../controllers/appointmentController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

// General routes
router.get('/doctors/search', auth, searchDoctors);
router.get('/doctors/:doctorId/slots', auth, getAvailableSlots);

// Appointment CRUD routes
router.get('/', auth, getAppointments);
router.get('/:id', auth, getAppointmentById);
router.post('/book', auth, bookAppointment);
router.put('/:id/cancel', auth, cancelAppointment);
router.patch('/:id/status', auth, updateAppointmentStatus);

module.exports = router;