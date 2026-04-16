const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const Stripe = require('stripe');
const axios = require('axios');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006/api/notifications/internal';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'medikaline-internal-token';

async function sendNotification(payload) {
  try {
    await axios.post(NOTIFICATION_SERVICE_URL, payload, {
      headers: {
        'x-service-token': INTERNAL_SERVICE_TOKEN,
      },
    });
  } catch (error) {
    console.error('Notification dispatch failed:', error.message);
  }
}

class PaymentService {
  constructor() {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;
  }

  assertStripeConfigured() {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env');
    }
  }

  async getAppointmentById(appointmentId) {
    const appointmentsCollection = mongoose.connection?.db?.collection('appointments');
    if (!appointmentsCollection) {
      throw new Error('Appointments collection is not available');
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new Error('Invalid appointment id');
    }

    const appointment = await appointmentsCollection.findOne({
      _id: new mongoose.Types.ObjectId(appointmentId),
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  resolveScopeQuery(userId, role) {
    if (role === 'admin') return {};
    if (role === 'doctor') return { doctorId: new mongoose.Types.ObjectId(userId) };
    return { patientId: new mongoose.Types.ObjectId(userId) };
  }

  async createPayment({ appointmentId, amount, currency = 'usd', paymentMethod = 'card', paymentMethodId, userId, role }) {
    this.assertStripeConfigured();

    const parsedAmount = Number(amount);
    if (!appointmentId || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('appointmentId and a valid amount are required');
    }

    const appointment = await this.getAppointmentById(appointmentId);
    const patientId = appointment.patientId?.toString();
    const doctorId = appointment.doctorId?.toString();

    if (role === 'patient' && patientId !== userId) {
      throw new Error('Unauthorized: you can only pay for your own appointments');
    }

    if (role === 'doctor' && doctorId !== userId) {
      throw new Error('Unauthorized: you can only access your related appointment payments');
    }

    if ((appointment.status || '').toLowerCase() !== 'confirmed') {
      throw new Error('Payment is only available after the doctor accepts the appointment');
    }

    const payment = await Payment.create({
      appointmentId,
      patientId,
      doctorId,
      amount: parsedAmount,
      currency: currency.toUpperCase(),
      paymentMethod,
      status: 'pending',
      provider: 'stripe',
      updatedAt: new Date(),
    });

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(parsedAmount * 100),
        currency: currency.toLowerCase(),
        confirm: true,
        payment_method: paymentMethodId || 'pm_card_visa',
        payment_method_types: ['card'],
        metadata: {
          paymentId: payment._id.toString(),
          appointmentId: appointmentId.toString(),
          patientId: patientId || '',
          doctorId: doctorId || '',
        },
      });

      payment.stripePaymentIntentId = intent.id;
      payment.transactionId = intent.latest_charge || intent.id;
      payment.status = intent.status === 'succeeded' ? 'completed' : 'pending';
      payment.updatedAt = new Date();
      await payment.save();

      return {
        payment,
        provider: 'stripe',
        paymentIntentStatus: intent.status,
      };
    } catch (error) {
      payment.status = 'failed';
      payment.failureReason = error?.message || 'Payment processing failed';
      payment.updatedAt = new Date();
      await payment.save();
      throw error;
    }
  }

  async verifyPayment(id, userId, role) {
    this.assertStripeConfigured();

    const payment = await Payment.findById(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const appointment = await this.getAppointmentById(payment.appointmentId.toString());

    const actor = userId?.toString();
    if (role === 'patient' && payment.patientId?.toString() !== actor) {
      throw new Error('Unauthorized');
    }
    if (role === 'doctor' && payment.doctorId?.toString() !== actor) {
      throw new Error('Unauthorized');
    }

    if (!payment.stripePaymentIntentId) {
      throw new Error('Stripe payment intent not found for this payment');
    }

    const intent = await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    if (intent.status === 'succeeded') {
      payment.status = 'completed';
      payment.transactionId = intent.latest_charge || intent.id;
      payment.failureReason = undefined;

      await sendNotification({
        userId: payment.patientId,
        title: 'Payment completed',
        type: 'payment_completed',
        message: 'Your appointment payment has been completed successfully.',
        metadata: {
          paymentId: payment._id,
          appointmentId: payment.appointmentId,
          status: 'completed',
        },
      });

      const doctorContext = await this.getDoctorUserId(appointment.doctorId);
      if (doctorContext) {
        await sendNotification({
          userId: doctorContext,
          title: 'Patient payment completed',
          type: 'payment_completed',
          message: 'A patient completed payment for an accepted appointment.',
          metadata: {
            paymentId: payment._id,
            appointmentId: payment.appointmentId,
            status: 'completed',
          },
        });
      }
    } else if (['canceled', 'requires_payment_method'].includes(intent.status)) {
      payment.status = 'failed';
      payment.failureReason = `Stripe status: ${intent.status}`;

      await sendNotification({
        userId: payment.patientId,
        title: 'Payment failed',
        type: 'payment_failed',
        message: 'Your payment could not be completed. Please try again with another card.',
        metadata: {
          paymentId: payment._id,
          appointmentId: payment.appointmentId,
          status: intent.status,
        },
      });
    } else {
      payment.status = 'pending';
    }

    payment.updatedAt = new Date();
    await payment.save();
    return payment;
  }

  async getDoctorUserId(doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return null;
    }

    const doctorsCollection = mongoose.connection?.db?.collection('doctors');
    if (!doctorsCollection) {
      return null;
    }

    const doctor = await doctorsCollection.findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
    return doctor?.userId || null;
  }

  async getPayments(userId, role) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user id');
    }

    const query = this.resolveScopeQuery(userId, role);
    return Payment.find(query).sort({ createdAt: -1 });
  }
}

module.exports = new PaymentService();