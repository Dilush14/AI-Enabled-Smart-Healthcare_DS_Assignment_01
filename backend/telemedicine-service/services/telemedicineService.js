const axios = require('axios');
const Session = require('../models/Session');

class TelemedicineService {
  async createSession(appointmentId) {
    const roomName = `appointment-${appointmentId}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;
    const session = new Session({ appointmentId, meetingLink });
    await session.save();
    return session;
  }

  async getSession(id) {
    return await Session.findById(id);
  }
}

module.exports = new TelemedicineService();