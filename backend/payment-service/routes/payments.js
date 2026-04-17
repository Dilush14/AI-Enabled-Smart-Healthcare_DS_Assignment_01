const express = require('express');
const { createPayment, verifyPayment, getPayments, getPaymentByAppointment } = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/create', auth, createPayment);
router.get('/appointment/:appointmentId', auth, getPaymentByAppointment);
router.put('/:id/verify', auth, verifyPayment);
router.get('/history', auth, getPayments);

module.exports = router;