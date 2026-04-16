const express = require('express');
const { createPayment, verifyPayment, getPayments } = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/create', auth, createPayment);
router.put('/:id/verify', auth, verifyPayment);
router.get('/history', auth, getPayments);

module.exports = router;