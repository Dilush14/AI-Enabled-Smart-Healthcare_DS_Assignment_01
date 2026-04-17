const axios = require('axios');
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Report = require('../models/Report');
const aiAnalysisService = require('./aiAnalysisService');

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

class TelemedicineService {
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

  async getAppointmentById(appointmentId) {
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return null;
    }

    const appointmentsCollection = mongoose.connection?.db?.collection('appointments');
    if (!appointmentsCollection) {
      return null;
    }

    return appointmentsCollection.findOne({ _id: new mongoose.Types.ObjectId(appointmentId) });
  }

  async getLatestPaymentForAppointment(appointmentId) {
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return null;
    }

    const paymentsCollection = mongoose.connection?.db?.collection('payments');
    if (!paymentsCollection) {
      return null;
    }

    return paymentsCollection.findOne(
      { appointmentId: new mongoose.Types.ObjectId(appointmentId) },
      { sort: { createdAt: -1 } }
    );
  }

  async resolveDoctorUserId(doctorId) {
    if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return null;
    }

    const usersCollection = mongoose.connection?.db?.collection('users');
    const doctorsCollection = mongoose.connection?.db?.collection('doctors');
    if (doctorsCollection) {
      const doctor = await doctorsCollection.findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
      if (doctor?.userId && mongoose.Types.ObjectId.isValid(doctor.userId)) {
        return doctor.userId.toString();
      }
    }

    if (usersCollection) {
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(doctorId) });
      if (user?._id) {
        return user._id.toString();
      }
    }

    return null;
  }

  formatSessionLabel(session) {
    const startedAt = session?.startTime ? new Date(session.startTime) : null;
    if (!startedAt || Number.isNaN(startedAt.getTime())) {
      return 'for your telemedicine consultation';
    }

    const dateLabel = startedAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeLabel = startedAt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `for ${dateLabel} at ${timeLabel}`;
  }

  async notifySessionCreated(session) {
    const doctorUserId = await this.resolveDoctorUserId(session.doctorId);
    const patient = await this.getUserById(session.patientId);
    const doctorUser = doctorUserId ? await this.getUserById(doctorUserId) : null;
    const sessionLabel = this.formatSessionLabel(session);

    await Promise.all([
      sendNotification({
        userId: session.patientId,
        title: 'Consultation room ready',
        type: 'session_created',
        message: `Your telemedicine session is ready ${sessionLabel}.`,
        metadata: {
          sessionId: session._id,
          appointmentId: session.appointmentId,
          meetingLink: session.meetingLink,
        },
      }),
      doctorUserId ? sendNotification({
        userId: doctorUserId,
        title: 'Consultation session created',
        type: 'session_created',
        message: `${patient?.name || 'A patient'} has an active telemedicine session ${sessionLabel}.`,
        metadata: {
          sessionId: session._id,
          appointmentId: session.appointmentId,
          patientId: session.patientId,
          patientName: patient?.name || '',
          doctorName: doctorUser?.name || '',
          meetingLink: session.meetingLink,
        },
      }) : Promise.resolve(),
    ]);
  }

  async notifySessionStatusChanged(session, status) {
    const doctorUserId = await this.resolveDoctorUserId(session.doctorId);
    const patient = await this.getUserById(session.patientId);
    const doctorUser = doctorUserId ? await this.getUserById(doctorUserId) : null;

    if (status === 'active') {
      await Promise.all([
        sendNotification({
          userId: session.patientId,
          title: 'Consultation started',
          type: 'session_started',
          message: 'Your telemedicine consultation has started.',
          metadata: {
            sessionId: session._id,
            appointmentId: session.appointmentId,
            status,
            meetingLink: session.meetingLink,
          },
        }),
        doctorUserId ? sendNotification({
          userId: doctorUserId,
          title: 'Consultation in progress',
          type: 'session_started',
          message: `Telemedicine consultation with ${patient?.name || 'the patient'} is now in progress.`,
          metadata: {
            sessionId: session._id,
            appointmentId: session.appointmentId,
            patientId: session.patientId,
            patientName: patient?.name || '',
            doctorName: doctorUser?.name || '',
            status,
          },
        }) : Promise.resolve(),
      ]);
    }

    if (status === 'ended') {
      await Promise.all([
        sendNotification({
          userId: session.patientId,
          title: 'Consultation ended',
          type: 'session_ended',
          message: 'Your telemedicine consultation has ended. Reports and notes will be available shortly.',
          metadata: {
            sessionId: session._id,
            appointmentId: session.appointmentId,
            status,
            endTime: session.endTime,
          },
        }),
        doctorUserId ? sendNotification({
          userId: doctorUserId,
          title: 'Consultation closed',
          type: 'session_ended',
          message: `Telemedicine consultation with ${patient?.name || 'the patient'} has ended.`,
          metadata: {
            sessionId: session._id,
            appointmentId: session.appointmentId,
            patientId: session.patientId,
            patientName: patient?.name || '',
            doctorName: doctorUser?.name || '',
            status,
            endTime: session.endTime,
          },
        }) : Promise.resolve(),
      ]);
    }
  }

  async notifyReportUpload(report, actorRole) {
    const doctorUserId = await this.resolveDoctorUserId(report.doctorId);
    const patient = await this.getUserById(report.patientId);
    const doctorUser = doctorUserId ? await this.getUserById(doctorUserId) : null;
    const reportLabel = report.reportType?.replaceAll('_', ' ') || 'medical report';

    const targetUserId = actorRole === 'doctor' ? report.patientId : doctorUserId;
    const targetTitle = actorRole === 'doctor' ? 'New report from your doctor' : 'New patient report uploaded';
    const targetMessage = actorRole === 'doctor'
      ? `${doctorUser?.name || 'Your doctor'} uploaded a ${reportLabel} for your consultation.`
      : `${patient?.name || 'A patient'} uploaded a ${reportLabel} for review.`;

    if (targetUserId) {
      await sendNotification({
        userId: targetUserId,
        title: targetTitle,
        type: 'report_uploaded',
        message: targetMessage,
        metadata: {
          reportId: report._id,
          sessionId: report.sessionId,
          appointmentId: report.appointmentId,
          patientId: report.patientId,
          doctorId: report.doctorId,
          reportType: report.reportType,
          uploadedBy: actorRole,
        },
      });
    }

    const aiSuggestions = Array.isArray(report.aiAnalysis?.suggestions)
      ? report.aiAnalysis.suggestions.slice(0, 3)
      : [];
    const source = report.aiAnalysis?.analysisSource === 'openai' ? 'AI engine' : 'AI fallback';
    const suggestionSummary = aiSuggestions.length > 0
      ? aiSuggestions.join(' | ')
      : 'Open the report to review your personalized guidance.';

    await sendNotification({
      userId: report.patientId,
      title: 'AI health suggestions ready',
      type: 'ai_suggestions_ready',
      message: `${source} generated guidance for your ${reportLabel}: ${suggestionSummary}`,
      metadata: {
        reportId: report._id,
        sessionId: report.sessionId,
        appointmentId: report.appointmentId,
        reportType: report.reportType,
        confidenceScore: report.aiAnalysis?.confidenceScore,
        analysisSource: report.aiAnalysis?.analysisSource || 'local-fallback',
      },
    });

    if (doctorUserId) {
      await sendNotification({
        userId: doctorUserId,
        title: 'AI suggestions generated',
        type: 'ai_suggestions_ready',
        message: `AI guidance is ready for ${patient?.name || 'your patient'}'s ${reportLabel}.`,
        metadata: {
          reportId: report._id,
          sessionId: report.sessionId,
          appointmentId: report.appointmentId,
          patientId: report.patientId,
          patientName: patient?.name || '',
          reportType: report.reportType,
          confidenceScore: report.aiAnalysis?.confidenceScore,
          analysisSource: report.aiAnalysis?.analysisSource || 'local-fallback',
        },
      });
    }
  }

  async notifyDoctorNotesAdded(report) {
    const doctorUserId = await this.resolveDoctorUserId(report.doctorId);
    const doctorUser = doctorUserId ? await this.getUserById(doctorUserId) : null;
    const reportLabel = report.reportType?.replaceAll('_', ' ') || 'medical report';

    await sendNotification({
      userId: report.patientId,
      title: 'Doctor notes added',
      type: 'doctor_notes_added',
      message: `${doctorUser?.name || 'Your doctor'} added recommendations on your ${reportLabel}.`,
      metadata: {
        reportId: report._id,
        sessionId: report.sessionId,
        appointmentId: report.appointmentId,
        doctorId: report.doctorId,
        reportType: report.reportType,
      },
    });
  }

  async createSession(appointmentId, patientId, doctorId) {
    if (appointmentId) {
      const appointment = await this.getAppointmentById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const appointmentStatus = (appointment.status || '').toLowerCase();
      if (appointmentStatus !== 'confirmed') {
        throw new Error('Video consultation is only available after the appointment is confirmed');
      }

      const latestPayment = await this.getLatestPaymentForAppointment(appointmentId);
      if ((latestPayment?.status || '').toLowerCase() !== 'completed') {
        throw new Error('Payment is required before starting a video consultation');
      }

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

    await this.notifySessionCreated(session);

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

    if (session) {
      await this.notifySessionStatusChanged(session, status);
    }

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

    if (session) {
      await this.notifySessionStatusChanged(session, 'ended');
    }

    return session;
  }

  async updateConsultationNotes(sessionId, consultationNotes = '') {
    return await Session.findByIdAndUpdate(
      sessionId,
      {
        consultationNotes,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async updatePrescription(sessionId, prescription = {}) {
    const payload = {
      diagnosis: prescription.diagnosis || '',
      medication: prescription.medication || '',
      followUpAdvice: prescription.followUpAdvice || '',
      updatedAt: new Date()
    };

    return await Session.findByIdAndUpdate(
      sessionId,
      {
        prescription: payload,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async uploadReport(sessionId, patientId, doctorId, appointmentId, file, reportType, actorRole = 'patient') {
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

      await this.notifyReportUpload(report, actorRole);

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

    if (report) {
      await this.notifyDoctorNotesAdded(report);
    }

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