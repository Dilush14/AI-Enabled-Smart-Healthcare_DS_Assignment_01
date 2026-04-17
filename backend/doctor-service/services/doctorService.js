const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');

class DoctorService {
  hasIdProof(record) {
    if (!record || typeof record !== 'object') {
      return false;
    }

    const proofCandidates = [
      record.idProofUrl,
      record.idProof,
      record.idProofDocument,
      record.idProofDocumentUrl,
      record.governmentIdProofUrl,
      record.licenseDocumentUrl,
      record.licenseProofUrl,
      record.licenseImageUrl,
    ];

    return proofCandidates.some((candidate) => {
      if (typeof candidate === 'string') {
        return candidate.trim().length > 0;
      }

      if (candidate && typeof candidate === 'object') {
        const nested = candidate.url || candidate.path || candidate.secure_url || candidate.location;
        return typeof nested === 'string' && nested.trim().length > 0;
      }

      return false;
    });
  }

  assertProofBeforeVerification(doctorRecord, userRecord) {
    if (this.hasIdProof(doctorRecord) || this.hasIdProof(userRecord)) {
      return;
    }

    const error = new Error('Doctor cannot be verified until an ID proof document is uploaded.');
    error.statusCode = 400;
    throw error;
  }

  toObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return new mongoose.Types.ObjectId(id);
  }

  async getDoctorUsers(filters = {}) {
    const usersCollection = mongoose.connection.collection('users');
    const userQuery = { role: 'doctor' };

    if (filters.specialization) {
      userQuery.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    if (filters.verified === 'true') {
      userQuery.isVerified = true;
    }

    return usersCollection.find(userQuery).toArray();
  }

  mapUserToDoctor(user) {
    return {
      _id: user._id,
      userId: user,
      specialization: user.specialization || 'General Physician',
      licenseNumber: user.licenseNumber || 'N/A',
      idProofUrl: user.idProofUrl || user.idProofDocumentUrl || user.governmentIdProofUrl || user.licenseDocumentUrl || null,
      isVerified: user.isVerified || false,
      experience: user.experience || 0,
      rating: user.rating || 4.9,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      availability: Array.isArray(user.availability) ? user.availability : [],
      fallbackSource: 'user-service',
    };
  }

  async getAllDoctors(filters = {}) {
    const query = {};

    if (filters.specialization) {
      query.specialization = new RegExp(filters.specialization, 'i');
    }

    if (filters.verified === 'true') {
      query.isVerified = true;
    }

    const doctors = await Doctor.find(query).populate('userId');
    if (doctors.length > 0) {
      return doctors;
    }

    const doctorUsers = await this.getDoctorUsers(filters);
    return doctorUsers.map((user) => this.mapUserToDoctor(user));
  }

  async getDoctorById(id) {
    const doctor = await Doctor.findById(id).populate('userId');
    if (doctor) {
      return doctor;
    }

    const userId = this.toObjectId(id);
    if (!userId) {
      return null;
    }

    const doctorByUserId = await Doctor.findOne({ userId }).populate('userId');
    if (doctorByUserId) {
      return doctorByUserId;
    }

    const usersCollection = mongoose.connection.collection('users');
    const user = await usersCollection.findOne({
      _id: userId,
      role: 'doctor',
    });

    return user ? this.mapUserToDoctor(user) : null;
  }

  async updateDoctor(id, updates) {
    const usersCollection = mongoose.connection.collection('users');
    let updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, { new: true }).populate('userId');

    if (!updatedDoctor) {
      const userId = this.toObjectId(id);
      if (userId) {
        updatedDoctor = await Doctor.findOneAndUpdate(
          { userId },
          updates,
          { new: true }
        ).populate('userId');
      }
    }

    if (updatedDoctor) {
      const targetUserId = updatedDoctor.userId?._id || updatedDoctor.userId;
      if (targetUserId) {
        await usersCollection.updateOne(
          { _id: targetUserId, role: 'doctor' },
          { $set: updates }
        );
      }
      return updatedDoctor;
    }

    const fallbackUserId = this.toObjectId(id);
    if (!fallbackUserId) {
      return null;
    }

    await usersCollection.updateOne(
      { _id: fallbackUserId, role: 'doctor' },
      { $set: updates }
    );

    const user = await usersCollection.findOne({ _id: fallbackUserId, role: 'doctor' });
    return user ? this.mapUserToDoctor(user) : null;
  }

  async verifyDoctor(id) {
    const usersCollection = mongoose.connection.collection('users');
    const doctorById = await Doctor.findById(id);
    if (doctorById) {
      const targetUserId = doctorById.userId;
      const user = targetUserId
        ? await usersCollection.findOne({ _id: targetUserId, role: 'doctor' })
        : null;

      this.assertProofBeforeVerification(doctorById, user);

      const updatedDoctor = await Doctor.findByIdAndUpdate(id, { isVerified: true }, { new: true }).populate('userId');
      if (targetUserId) {
        await usersCollection.updateOne(
          { _id: targetUserId, role: 'doctor' },
          { $set: { isVerified: true } }
        );
      }
      return updatedDoctor;
    }

    const userId = this.toObjectId(id);
    if (!userId) {
      return null;
    }

    const doctorByUserId = await Doctor.findOne({ userId });
    const user = await usersCollection.findOne({ _id: userId, role: 'doctor' });
    if (!user) {
      return null;
    }

    this.assertProofBeforeVerification(doctorByUserId, user);

    if (doctorByUserId) {
      await Doctor.updateOne({ _id: doctorByUserId._id }, { $set: { isVerified: true } });
    }

    await usersCollection.updateOne(
      { _id: userId, role: 'doctor' },
      { $set: { isVerified: true } }
    );

    const updatedDoctor = await Doctor.findOne({ userId }).populate('userId');
    if (updatedDoctor) {
      return updatedDoctor;
    }

    const updatedUser = await usersCollection.findOne({ _id: userId, role: 'doctor' });
    return updatedUser ? this.mapUserToDoctor(updatedUser) : null;
  }

  async getAvailability(id) {
    const doctor = await Doctor.findById(id);
    if (doctor) {
      return doctor.availability;
    }

    const userId = this.toObjectId(id);
    if (!userId) {
      return null;
    }

    const doctorByUserId = await Doctor.findOne({ userId });
    if (doctorByUserId) {
      return doctorByUserId.availability;
    }

    const usersCollection = mongoose.connection.collection('users');
    const user = await usersCollection.findOne({
      _id: userId,
      role: 'doctor',
    });

    return user ? user.availability || [] : null;
  }
}

module.exports = new DoctorService();