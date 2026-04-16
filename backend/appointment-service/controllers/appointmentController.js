const appointmentService = require('../services/appointmentService');

const getAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointments(req.user.id, req.user.role);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.bookAppointment({ ...req.body, patientId: req.user.id });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.user.role);
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const searchDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const doctors = await appointmentService.searchDoctors(specialization);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAppointments, bookAppointment, cancelAppointment, searchDoctors };