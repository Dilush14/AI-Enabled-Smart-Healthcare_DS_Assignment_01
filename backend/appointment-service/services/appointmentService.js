const Appointment = require('../models/Appointment');
const axios = require('axios');
const mongoose = require('mongoose');

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

class AppointmentService {
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
    if (!doctor?.userId) {
      return { doctor, user: null };
    }

    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(doctor.userId) });
    return { doctor, user };
  }

  formatAppointmentLabel(appointment) {
    const date = appointment?.date ? new Date(appointment.date) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return appointment?.time ? `at ${appointment.time}` : 'for your appointment';
    }

    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${appointment.time}`;
  }

  async getLatestPaymentForAppointment(appointmentId) {
    const paymentsCollection = mongoose.connection?.db?.collection('payments');
    if (!paymentsCollection) {
      return null;
    }

    return paymentsCollection.findOne(
      { appointmentId: new mongoose.Types.ObjectId(appointmentId) },
      { sort: { createdAt: -1 } }
    );
  }

  async enrichAppointmentsWithPatients(appointments) {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return [];
    }

    const usersCollection = mongoose.connection?.db?.collection('users');
    if (!usersCollection) {
      return appointments;
    }

    const patientIds = [
      ...new Set(
        appointments
          .map((appointment) => appointment.patientId?.toString())
          .filter(Boolean)
      )
    ];

    if (patientIds.length === 0) {
      return appointments;
    }

    const objectIds = patientIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return appointments;
    }

    const users = await usersCollection
      .find({ _id: { $in: objectIds } })
      .project({ _id: 1, name: 1, age: 1, profilePhotoUrl: 1, email: 1 })
      .toArray();

    const usersById = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    return appointments.map((appointment) => {
      const plain = appointment.toObject ? appointment.toObject() : appointment;
      const patient = usersById[appointment.patientId?.toString()];
      return {
        ...plain,
        patientId: patient || plain.patientId,
      };
    });
  }

  async enrichAppointmentsWithPayments(appointments) {
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return [];
    }

    const paymentsCollection = mongoose.connection?.db?.collection('payments');
    if (!paymentsCollection) {
      return appointments;
    }

    const appointmentIds = appointments
      .map((appointment) => appointment._id?.toString())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (appointmentIds.length === 0) {
      return appointments;
    }

    const objectIds = appointmentIds.map((id) => new mongoose.Types.ObjectId(id));
    const payments = await paymentsCollection
      .find({ appointmentId: { $in: objectIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const paymentsByAppointment = payments.reduce((acc, payment) => {
      const key = payment.appointmentId?.toString();
      if (key && !acc[key]) {
        acc[key] = payment;
      }
      return acc;
    }, {});

    return appointments.map((appointment) => {
      const plain = appointment.toObject ? appointment.toObject() : appointment;
      const payment = paymentsByAppointment[plain._id?.toString()];
      return {
        ...plain,
        paymentStatus: payment?.status || 'pending',
        paymentId: payment?._id,
        paymentAmount: payment?.amount,
      };
    });
  }

  // Get appointments based on user role
  async getAppointments(userId, role, filter = {}) {
    let query = {};

    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'doctor') {
      query.doctorId = userId;
    }

    // Apply additional filters
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.startDate && filter.endDate) {
      query.date = {
        $gte: new Date(filter.startDate),
        $lte: new Date(filter.endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1, time: -1 });

    const withPatients = await this.enrichAppointmentsWithPatients(appointments);
    return this.enrichAppointmentsWithPayments(withPatients);
  }

  // Validate appointment data
  validateAppointmentData(data) {
    const errors = [];

    if (!data.doctorId || !data.doctorId.trim()) {
      errors.push('Doctor ID is required');
    }
    if (!data.date) {
      errors.push('Appointment date is required');
    } else {
      const appointmentDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        errors.push('Appointment date must be in the future');
      }
    }
    if (!data.time || !data.time.trim()) {
      errors.push('Appointment time is required');
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.time)) {
        errors.push('Time must be in HH:mm format (24-hour)');
      }
    }
    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must not exceed 500 characters');
    }

    return errors;
  }

  // Book an appointment
  async bookAppointment(appointmentData) {
    // Validate data
    const validationErrors = this.validateAppointmentData(appointmentData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if doctor exists
    try {
      const doctorExists = await this.verifyDoctor(appointmentData.doctorId);
      if (!doctorExists) {
        throw new Error('Doctor not found');
      }
    } catch (error) {
      throw new Error(`Doctor verification failed: ${error.message}`);
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctorId: appointmentData.doctorId,
      date: new Date(appointmentData.date),
      time: appointmentData.time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      throw new Error('This time slot is already booked');
    }

    // Create and save appointment
    const appointment = new Appointment({
      ...appointmentData,
      status: 'pending',
      date: new Date(appointmentData.date)
    });

    await appointment.save();

    const patient = await this.getUserById(appointment.patientId);
    const { user: doctorUser } = await this.getDoctorContext(appointment.doctorId);
    const appointmentLabel = this.formatAppointmentLabel(appointment);

    await Promise.all([
      sendNotification({
        userId: appointment.patientId,
        title: 'Appointment booked',
        type: 'appointment_booked',
        message: `Your appointment ${appointmentLabel} has been booked and is waiting for doctor acceptance.`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          status: 'pending',
          patientName: patient?.name || '',
        },
      }),
      doctorUser?._id ? sendNotification({
        userId: doctorUser._id,
        title: 'New appointment request',
        type: 'appointment_booked',
        message: `${patient?.name || 'A patient'} requested an appointment ${appointmentLabel}.`,
        metadata: {
          appointmentId: appointment._id,
          patientId: appointment.patientId,
          status: 'pending',
        },
      }) : Promise.resolve(),
    ]);

    return appointment;
  }

  // Verify doctor exists
  async verifyDoctor(doctorId) {
    try {
      const response = await axios.get(`http://localhost:3000/api/doctors/${doctorId}`);
      return response.data && response.data._id;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error verifying doctor:', error.message);
      // Don't throw, return null to allow graceful handling
      return null;
    }
  }

  // Cancel appointment
  async cancelAppointment(id, userId, role) {
    return this.updateAppointmentStatus(id, 'cancelled', userId, role);
  }

  // Update appointment status with role-based permissions
  async updateAppointmentStatus(id, status, userId, role) {
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const patientId = appointment.patientId?.toString();
    const doctorId = appointment.doctorId?.toString();
    const userId_str = userId.toString();

    // Role-based authorization
    if (role === 'patient') {
      if (patientId !== userId_str) {
        throw new Error('Unauthorized: You can only manage your own appointments');
      }
      if (status !== 'cancelled') {
        throw new Error('Patients can only cancel appointments');
      }
      if (appointment.status === 'completed') {
        throw new Error('Cannot cancel a completed appointment');
      }
    }

    if (role === 'doctor') {
      if (doctorId !== userId_str) {
        throw new Error('Unauthorized: You can only manage your appointments');
      }
      if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        throw new Error('Doctors can only confirm, complete, or cancel appointments');
      }

      if (status === 'completed') {
        const latestPayment = await this.getLatestPaymentForAppointment(appointment._id);
        if (!latestPayment || latestPayment.status !== 'completed') {
          throw new Error('Payment is not completed. Doctor cannot complete this appointment yet.');
        }
      }
    }

    appointment.status = status;
    appointment.updatedAt = new Date();
    await appointment.save();

    const patient = await this.getUserById(appointment.patientId);
    const { user: doctorUser } = await this.getDoctorContext(appointment.doctorId);
    const appointmentLabel = this.formatAppointmentLabel(appointment);

    if (role === 'doctor' && status === 'confirmed') {
      await sendNotification({
        userId: appointment.patientId,
        title: 'Appointment accepted',
        type: 'appointment_accepted',
        message: `Your appointment ${appointmentLabel} has been accepted. You can now pay for it.`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          status,
        },
      });
    }

    if (status === 'cancelled') {
      const recipientId = role === 'patient' ? doctorUser?._id : appointment.patientId;
      const recipientName = role === 'patient' ? `Dr. ${doctorUser?.name || 'your doctor'}` : patient?.name || 'the patient';

      if (recipientId) {
        await sendNotification({
          userId: recipientId,
          title: 'Appointment cancelled',
          type: 'appointment_cancelled',
          message: `${patient?.name || 'The patient'} cancelled the appointment ${appointmentLabel}.`,
          metadata: {
            appointmentId: appointment._id,
            cancelledBy: role,
            recipientName,
          },
        });
      }
    }

    if (role === 'doctor' && status === 'completed') {
      await sendNotification({
        userId: appointment.patientId,
        title: 'Consultation completed',
        type: 'consultation_completed',
        message: `Your consultation ${appointmentLabel} has been completed.`,
        metadata: {
          appointmentId: appointment._id,
          doctorId: appointment.doctorId,
          status,
        },
      });
    }

    return appointment;
  }

  // Search and filter doctors
  async searchDoctors(specialization, page = 1, limit = 10) {
    try {
      const params = {};
      if (specialization) {
        params.specialization = specialization;
      }
      params.page = page;
      params.limit = limit;

      const response = await axios.get('http://localhost:3000/api/doctors', { params });
      
      return {
        doctors: response.data || [],
        total: response.data?.length || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Error searching doctors:', error.message);
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }
  }

  // Get appointment by ID
  async getAppointmentById(id) {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  // Get doctor's available slots (mock implementation)
  async getAvailableSlots(doctorId, date) {
    try {
      // Here you can add logic to fetch doctor's availability
      // For now, return standard slots
      const slots = this.generateTimeSlots('09:00', '17:00', 30);
      
      // Filter out already booked slots
      const bookedAppointments = await Appointment.find({
        doctorId: doctorId,
        date: new Date(date),
        status: { $in: ['pending', 'confirmed'] }
      });

      const bookedTimes = bookedAppointments.map(apt => apt.time);
      const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

      return availableSlots;
    } catch (error) {
      throw new Error(`Failed to fetch available slots: ${error.message}`);
    }
  }

  // Generate time slots
  generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    let current = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  }
}

module.exports = new AppointmentService();