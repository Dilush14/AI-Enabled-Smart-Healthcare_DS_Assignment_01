const express = require('express');
const { getAppointments, bookAppointment, cancelAppointment, searchDoctors } = require('../controllers/appointmentController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, getAppointments);
router.post('/book', auth, bookAppointment);
router.put('/:id/cancel', auth, cancelAppointment);
router.get('/search', auth, searchDoctors);

module.exports = router;