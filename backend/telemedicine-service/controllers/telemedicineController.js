const telemedicineService = require('../services/telemedicineService');

const createSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const session = await telemedicineService.createSession(appointmentId);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSession = async (req, res) => {
  try {
    const session = await telemedicineService.getSession(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSession, getSession };