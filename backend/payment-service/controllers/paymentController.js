const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
  try {
    const result = await paymentService.createPayment({
      ...req.body,
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed through Stripe test API',
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const payment = await paymentService.verifyPayment(req.params.id, req.user.id, req.user.role);
    res.json({
      success: true,
      message: 'Payment verification complete',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPayments(req.user.id, req.user.role);
    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, verifyPayment, getPayments };