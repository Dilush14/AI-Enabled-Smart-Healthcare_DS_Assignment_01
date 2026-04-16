const axios = require('axios');
const Payment = require('../models/Payment');

class PaymentService {
  async createPayment(appointmentId, amount) {
    const payment = new Payment({ appointmentId, amount });
    await payment.save();
    return payment;
  }

  async verifyPayment(id) {
    const payment = await Payment.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
    return payment;
  }

  async getPayments(userId) {
    return await Payment.find();
  }
}

module.exports = new PaymentService();