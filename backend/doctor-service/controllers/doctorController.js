const doctorService = require('../services/doctorService');

const getDoctors = async (req, res) => {
  try {
    const { specialization, verified } = req.query;
    const doctors = await doctorService.getAllDoctors({ specialization, verified });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadIdProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file for ID proof.' });
    }

    const doctor = await doctorService.uploadIdProof(req.params.id, req.file, req.user);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const addDoctorRating = async (req, res) => {
  try {
    const doctor = await doctorService.addDoctorRating(req.params.id, req.body, req.user);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json(doctor);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const verifyDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.verifyDoctor(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const availability = await doctorService.getAvailability(req.params.id);
    if (!availability) return res.status(404).json({ message: 'Doctor not found' });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDoctors, getDoctor, updateDoctor, uploadIdProof, addDoctorRating, verifyDoctor, getAvailability };