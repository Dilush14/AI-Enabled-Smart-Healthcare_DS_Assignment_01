const Doctor = require('../models/Doctor');

class DoctorService {
  async getAllDoctors(filters = {}) {
    const query = {};

    if (filters.specialization) {
      query.specialization = new RegExp(filters.specialization, 'i');
    }

    if (filters.verified === 'true') {
      query.isVerified = true;
    }

    return await Doctor.find(query).populate('userId');
  }

  async getDoctorById(id) {
    return await Doctor.findById(id).populate('userId');
  }

  async updateDoctor(id, updates) {
    return await Doctor.findByIdAndUpdate(id, updates, { new: true });
  }

  async verifyDoctor(id) {
    return await Doctor.findByIdAndUpdate(id, { isVerified: true }, { new: true });
  }

  async getAvailability(id) {
    const doctor = await Doctor.findById(id);
    return doctor ? doctor.availability : null;
  }
}

module.exports = new DoctorService();