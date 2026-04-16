const Doctor = require('../models/Doctor');

class DoctorService {
  async getAllDoctors() {
    return await Doctor.find().populate('userId');
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
    return doctor.availability;
  }
}

module.exports = new DoctorService();