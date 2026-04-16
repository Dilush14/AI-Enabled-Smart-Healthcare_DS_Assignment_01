const Appointment = require('../models/Appointment');

class AppointmentService {
  async getAppointments(userId, role) {
    if (role === 'patient') {
      return await Appointment.find({ patientId: userId }).populate('doctorId');
    } else if (role === 'doctor') {
      return await Appointment.find({ doctorId: userId }).populate('patientId');
    }
    return await Appointment.find().populate('patientId doctorId');
  }

  async bookAppointment(appointmentData) {
    const appointment = new Appointment(appointmentData);
    await appointment.save();
    return appointment;
  }

  async cancelAppointment(id, userId, role) {
    const appointment = await Appointment.findById(id);
    if (!appointment) throw new Error('Appointment not found');
    if (role === 'patient' && appointment.patientId.toString() !== userId) throw new Error('Unauthorized');
    if (role === 'doctor' && appointment.doctorId.toString() !== userId) throw new Error('Unauthorized');
    appointment.status = 'cancelled';
    await appointment.save();
    return appointment;
  }

  async searchDoctors(specialization) {
    // Mock: in real, call doctor service
    return [];
  }
}

module.exports = new AppointmentService();