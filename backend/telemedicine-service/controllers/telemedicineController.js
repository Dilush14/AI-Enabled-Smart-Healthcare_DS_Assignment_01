const telemedicineService = require('../services/telemedicineService');

const createSession = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient ID is required' 
      });
    }

    const session = await telemedicineService.createSession(appointmentId, patientId, doctorId);
    res.status(201).json({
      success: true,
      message: 'Telemedicine session created',
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSession = async (req, res) => {
  try {
    const session = await telemedicineService.getSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessionByAppointment = async (req, res) => {
  try {
    const session = await telemedicineService.getSessionByAppointmentId(req.params.appointmentId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'active', 'ended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const session = await telemedicineService.updateSessionStatus(id, status);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await telemedicineService.endSession(id, notes || '');
    res.json({ success: true, message: 'Session ended', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConsultationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { consultationNotes } = req.body;

    const session = await telemedicineService.updateConsultationNotes(id, consultationNotes || '');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, message: 'Consultation notes saved', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, medication, followUpAdvice } = req.body;

    const session = await telemedicineService.updatePrescription(id, {
      diagnosis,
      medication,
      followUpAdvice,
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, message: 'Prescription saved', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { sessionId, patientId, doctorId, appointmentId, reportType } = req.body;

    if (!sessionId || !patientId) {
      return res.status(400).json({ 
        success: false,
        message: 'Session ID and Patient ID are required' 
      });
    }

    const report = await telemedicineService.uploadReport(
      sessionId,
      patientId,
      doctorId,
      appointmentId,
      req.file,
      reportType,
      req.user?.role || 'patient'
    );

    res.status(201).json({
      success: true,
      message: 'Report uploaded and AI analysis completed',
      data: report
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { sessionId, patientId } = req.query;
    const reports = await telemedicineService.getReports(sessionId, patientId);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await telemedicineService.getReportById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addDoctorNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, recommendations } = req.body;

    const report = await telemedicineService.addDoctorNotes(id, notes, recommendations);
    res.json({ success: true, message: 'Doctor notes added', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessionReports = async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await telemedicineService.getSessionReports(id);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientReports = async (req, res) => {
  try {
    const patientId = req.user.id;
    const reports = await telemedicineService.getPatientReports(patientId);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  createSession, 
  getSession,
  getSessionByAppointment,
  updateSessionStatus,
  endSession,
  updateConsultationNotes,
  updatePrescription,
  uploadReport,
  getReports,
  getReportById,
  addDoctorNotes,
  getSessionReports,
  getPatientReports
};