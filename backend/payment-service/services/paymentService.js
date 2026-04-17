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

  async getUserById(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const usersCollection = mongoose.connection?.db?.collection('users');
    if (!usersCollection) {
      return null;
    }

    return usersCollection.findOne({ _id: new mongoose.Types.ObjectId(userId) });
  }

  async getDoctorContext(doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return { doctor: null, user: null };
    }

    const doctorsCollection = mongoose.connection?.db?.collection('doctors');
    const usersCollection = mongoose.connection?.db?.collection('users');
    if (!doctorsCollection || !usersCollection) {
      return { doctor: null, user: null };
    }

    const doctor = await doctorsCollection.findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
    if (doctor?.userId) {
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(doctor.userId) });
      return { doctor, user };
    }

    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
    return { doctor, user };
  }

  resolveScopeQuery(userId, role) {
    if (role === 'admin') return {};
    if (role === 'doctor') return { doctorId: new mongoose.Types.ObjectId(userId) };
    return { patientId: new mongoose.Types.ObjectId(userId) };
  }

  async getPaymentForAppointment(appointmentId, userId, role) {
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new Error('Invalid appointment id');
    }

    const payment = await Payment.findOne({ appointmentId }).sort({ createdAt: -1 });
    if (!payment) {
      return null;
    }

    const appointment = await this.getAppointmentById(appointmentId);
    const patientId = appointment.patientId?.toString();
    const doctorId = appointment.doctorId?.toString();
    const actor = userId?.toString();

    if (role === 'patient' && patientId !== actor) {
      throw new Error('Unauthorized: you can only access your own appointment payments');
    }

    if (role === 'doctor' && doctorId !== actor) {
      throw new Error('Unauthorized: you can only access related appointment payments');
    }

    return payment;
  }

  async createPayment({ appointmentId, amount, currency = 'usd', paymentMethod = 'card', userId, role }) {
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

    let payment = await Payment.findOne({ appointmentId }).sort({ createdAt: -1 });

    if (payment && payment.status === 'completed') {
      const completedIntent = payment.stripePaymentIntentId
        ? await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId)
        : null;

      return {
        payment,
        clientSecret: completedIntent?.client_secret || null,
        provider: 'stripe',
        paymentIntentStatus: completedIntent?.status || 'succeeded',
      };
    }

    if (!payment) {
      payment = await Payment.create({
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
    } else {
      payment.amount = parsedAmount;
      payment.currency = currency.toUpperCase();
      payment.paymentMethod = paymentMethod;
      payment.provider = 'stripe';
      payment.status = 'pending';
      payment.failureReason = undefined;
      payment.updatedAt = new Date();
    }

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(parsedAmount * 100),
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          paymentId: payment._id.toString(),
          appointmentId: appointmentId.toString(),
          patientId: patientId || '',
          doctorId: doctorId || '',
        },
      });

      payment.stripePaymentIntentId = intent.id;
      payment.transactionId = intent.status === 'succeeded' ? (intent.latest_charge || intent.id) : undefined;
      payment.status = intent.status === 'succeeded' ? 'completed' : 'pending';
      payment.updatedAt = new Date();
      await payment.save();

      return {
        payment,
        clientSecret: intent.client_secret,
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

  async getPaymentByAppointment(appointmentId, userId, role) {
    const payment = await this.getPaymentForAppointment(appointmentId, userId, role);
    if (!payment) {
      return null;
    }

    if (payment.stripePaymentIntentId) {
      const intent = await this.stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      return {
        ...payment.toObject(),
        clientSecret: intent.client_secret || null,
        paymentIntentStatus: intent.status,
      };
    }

    return payment;
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
    const patient = await this.getUserById(appointment.patientId);
    const { user: doctorUser } = await this.getDoctorContext(appointment.doctorId);

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
          patientName: patient?.name || '',
          doctorName: doctorUser?.name || '',
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
            patientName: patient?.name || '',
            doctorName: doctorUser?.name || '',
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
          patientName: patient?.name || '',
          doctorName: doctorUser?.name || '',
          status: intent.status,
        },
      });

      const doctorContext = await this.getDoctorUserId(appointment.doctorId);
      if (doctorContext) {
        await sendNotification({
          userId: doctorContext,
          title: 'Patient payment failed',
          type: 'payment_failed',
          message: 'A patient payment could not be completed for an accepted appointment.',
          metadata: {
            paymentId: payment._id,
            appointmentId: payment.appointmentId,
            patientName: patient?.name || '',
            doctorName: doctorUser?.name || '',
            status: intent.status,
          },
        });
      }
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

    const usersCollection = mongoose.connection?.db?.collection('users');
    const doctorsCollection = mongoose.connection?.db?.collection('doctors');
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    if (doctorsCollection) {
      const doctor = await doctorsCollection.findOne({ _id: doctorObjectId });
      if (doctor?.userId) {
        return doctor.userId;
      }
    }

    if (usersCollection) {
      const user = await usersCollection.findOne({ _id: doctorObjectId });
      if (user?._id) {
        return user._id;
      }
    }

    return null;
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