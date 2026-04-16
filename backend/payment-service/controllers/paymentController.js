const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const payment = await paymentService.createPayment(appointmentId, amount);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await paymentService.verifyPayment(req.params.id);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPayments(req.user.id);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPayment, verifyPayment, getPayments };