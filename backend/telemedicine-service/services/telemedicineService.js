const axios = require('axios');
const Session = require('../models/Session');
const Report = require('../models/Report');
const aiAnalysisService = require('./aiAnalysisService');

class TelemedicineService {
  async createSession(appointmentId, patientId, doctorId) {
    if (appointmentId) {
      const existingSession = await Session.findOne({ appointmentId });
      if (existingSession) {
        return existingSession;
      }
    }

    const roomName = appointmentId
      ? `appointment-${appointmentId}-${Date.now()}`
      : `patient-${patientId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    const sessionPayload = {
      patientId,
      meetingLink,
      startTime: new Date(),
    };

    if (appointmentId) {
      sessionPayload.appointmentId = appointmentId;
    }
    if (doctorId) {
      sessionPayload.doctorId = doctorId;
    }

    const session = new Session(sessionPayload);
    await session.save();
    return session;
  }

  async getSession(id) {
    return await Session.findById(id);
  }

  async getSessionByAppointmentId(appointmentId) {
    return await Session.findOne({ appointmentId });
  }

  async updateSessionStatus(sessionId, status) {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    return session;
  }

  async endSession(sessionId, notes = '') {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { 
        status: 'ended',
        endTime: new Date(),
        notes,
        updatedAt: new Date()
      },
      { new: true }
    );
    return session;
  }

  async uploadReport(sessionId, patientId, doctorId, appointmentId, file, reportType) {
    try {
      const fileUrl = `/uploads/${file.filename}`;
      const fileName = file.originalname;
      
      let fileTypeEnum = 'document';
      if (file.mimetype.startsWith('image/')) {
        fileTypeEnum = 'image';
      } else if (file.mimetype === 'application/pdf') {
        fileTypeEnum = 'pdf';
      }

      const reportPayload = {
        sessionId,
        patientId,
        fileName,
        fileUrl,
        fileType: fileTypeEnum,
        reportType: reportType || 'general'
      };

      if (doctorId) {
        reportPayload.doctorId = doctorId;
      }
      if (appointmentId) {
        reportPayload.appointmentId = appointmentId;
      }

      const report = new Report(reportPayload);

      const analysis = await aiAnalysisService.analyzeReport(
        reportType || 'general',
        file.originalname,
        `Medical report uploaded for review`
      );

      report.aiAnalysis = analysis;
      await report.save();

      return report;
    } catch (error) {
      console.error('Report upload error:', error);
      throw new Error(`Failed to upload report: ${error.message}`);
    }
  }

  async getReports(sessionId = null, patientId = null) {
    const query = {};
    if (sessionId) query.sessionId = sessionId;
    if (patientId) query.patientId = patientId;

    return await Report.find(query).sort({ uploadedAt: -1 });
  }

  async getReportById(reportId) {
    return await Report.findById(reportId);
  }

  async addDoctorNotes(reportId, notes, recommendations = []) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        doctorNotes: notes,
        doctorRecommendations: recommendations,
        updatedAt: new Date()
      },
      { new: true }
    );
    return report;
  }

  async getSessionReports(sessionId) {
    return await Report.find({ sessionId }).sort({ uploadedAt: -1 });
  }

  async getPatientReports(patientId) {
    return await Report.find({ patientId }).sort({ uploadedAt: -1 });
  }
}

module.exports = new TelemedicineService();