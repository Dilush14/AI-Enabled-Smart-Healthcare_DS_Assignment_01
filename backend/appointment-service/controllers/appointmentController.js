const appointmentService = require('../services/appointmentService');

// Get appointments based on user role and filters
const getAppointments = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.startDate = startDate;
      filter.endDate = endDate;
    }

    const appointments = await appointmentService.getAppointments(req.user.id, req.user.role, filter);
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// Book a new appointment
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, date, and time are required'
      });
    }

    const appointmentData = {
      patientId: req.user.id,
      doctorId,
      date,
      time,
      notes: notes || ''
    };

    const appointment = await appointmentService.bookAppointment(appointmentData);
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    const appointment = await appointmentService.cancelAppointment(id, req.user.id, req.user.role);
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const appointment = await appointmentService.updateAppointmentStatus(
      id,
      status,
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Search doctors by specialization
const searchDoctors = async (req, res, next) => {
  try {
    const { specialization, page = 1, limit = 10 } = req.query;

    const result = await appointmentService.searchDoctors(
      specialization,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get available appointment slots for a doctor
const getAvailableSlots = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId || req.query.doctorId;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const slots = await appointmentService.getAvailableSlots(doctorId, date);
    
    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

// Get single appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await appointmentService.getAppointmentById(id);
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  bookAppointment,
  cancelAppointment,
  searchDoctors,
  updateAppointmentStatus,
  getAvailableSlots,
  getAppointmentById
};