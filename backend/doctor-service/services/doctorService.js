const Doctor = require('../models/Doctor');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

class DoctorService {
  isVerifiedFilterEnabled(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  async uploadImageToCloudinary(fileBuffer, userId) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const error = new Error('Cloudinary is not configured for doctor ID proof uploads.');
      error.statusCode = 500;
      throw error;
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'doctor-id-proofs',
          public_id: `doctor-${String(userId || 'unknown')}-${Date.now()}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      );

      stream.end(fileBuffer);
    });
  }

  assertDoctorCanUpdateTarget(requester, targetUserId) {
    if (!requester || !requester.role) {
      const error = new Error('Unauthorized request');
      error.statusCode = 401;
      throw error;
    }

    if (requester.role === 'admin') {
      return;
    }

    if (requester.role !== 'doctor' || String(requester.id) !== String(targetUserId)) {
      const error = new Error('You can only upload ID proof for your own doctor account.');
      error.statusCode = 403;
      throw error;
    }
  }

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

  async ensureDoctorRecordByUserId(userId) {
    if (!userId) {
      return null;
    }

    const usersCollection = mongoose.connection.collection('users');
    let doctor = await Doctor.findOne({ userId }).populate('userId');
    if (doctor) {
      return doctor;
    }

    const user = await usersCollection.findOne({ _id: userId, role: 'doctor' });
    if (!user) {
      return null;
    }

    const created = await Doctor.create({
      userId,
      specialization: user.specialization || 'General Physician',
      licenseNumber: user.licenseNumber || '',
      idProofUrl: user.idProofUrl || user.idProofDocumentUrl || user.governmentIdProofUrl || user.licenseDocumentUrl || '',
      about: user.about || '',
      clinicName: user.clinicName || '',
      clinicAddress: user.clinicAddress || user.address || '',
      experience: user.experience || 0,
      totalPatients: user.totalPatients || 0,
      ratingAverage: user.ratingAverage || 0,
      ratingCount: user.ratingCount || 0,
      isVerified: Boolean(user.isVerified),
      availability: Array.isArray(user.availability) ? user.availability : [],
    });

    doctor = await Doctor.findById(created._id).populate('userId');
    return doctor;
  }

  async getDoctorUsers(filters = {}) {
    const usersCollection = mongoose.connection.collection('users');
    const userQuery = { role: 'doctor' };

    if (filters.specialization) {
      userQuery.specialization = { $regex: filters.specialization, $options: 'i' };
    }

    if (this.isVerifiedFilterEnabled(filters.verified)) {
      userQuery.isVerified = true;
    }

    return usersCollection.find(userQuery).toArray();
  }

  mapUserToDoctor(user) {
    return {
      _id: user._id,
      userId: user,
      specialization: user.specialization || 'General Physician',
      licenseNumber: user.licenseNumber || '',
      idProofUrl: user.idProofUrl || user.idProofDocumentUrl || user.governmentIdProofUrl || user.licenseDocumentUrl || null,
      isVerified: user.isVerified || false,
      about: user.about || '',
      clinicName: user.clinicName || '',
      clinicAddress: user.clinicAddress || user.address || '',
      experience: user.experience || 0,
      totalPatients: user.totalPatients || 0,
      ratingAverage: user.ratingAverage || 0,
      ratingCount: user.ratingCount || 0,
      rating: user.ratingAverage || user.rating || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      availability: Array.isArray(user.availability) ? user.availability : [],
      fallbackSource: 'user-service',
    };
  }

  toDoctorListKey(record) {
    if (!record || typeof record !== 'object') {
      return '';
    }

    const rawId = record.userId?._id || record.userId || record._id;
    return String(rawId || '');
  }

  normalizeDoctorRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    if (record.fallbackSource === 'user-service') {
      return record;
    }

    const populatedUser = record.userId && typeof record.userId === 'object' ? record.userId : null;
    const sourceUser = populatedUser || {};

    return {
      _id: record._id,
      userId: populatedUser || record.userId,
      specialization: record.specialization || sourceUser.specialization || 'General Physician',
      licenseNumber: record.licenseNumber || sourceUser.licenseNumber || '',
      idProofUrl: record.idProofUrl || sourceUser.idProofUrl || sourceUser.idProofDocumentUrl || sourceUser.governmentIdProofUrl || sourceUser.licenseDocumentUrl || null,
      isVerified: Boolean(record.isVerified ?? sourceUser.isVerified),
      about: record.about || sourceUser.about || '',
      clinicName: record.clinicName || sourceUser.clinicName || '',
      clinicAddress: record.clinicAddress || sourceUser.clinicAddress || sourceUser.address || '',
      experience: record.experience ?? sourceUser.experience ?? 0,
      totalPatients: record.totalPatients ?? sourceUser.totalPatients ?? 0,
      ratingAverage: record.ratingAverage ?? sourceUser.ratingAverage ?? 0,
      ratingCount: record.ratingCount ?? sourceUser.ratingCount ?? 0,
      rating: record.ratingAverage ?? sourceUser.ratingAverage ?? record.rating ?? sourceUser.rating ?? 0,
      createdAt: record.createdAt || sourceUser.createdAt,
      updatedAt: record.updatedAt || sourceUser.updatedAt,
      availability: Array.isArray(record.availability) ? record.availability : (Array.isArray(sourceUser.availability) ? sourceUser.availability : []),
    };
  }

  async getAllDoctors(filters = {}) {
    const query = {};

    if (filters.specialization) {
      query.specialization = new RegExp(filters.specialization, 'i');
    }

    if (this.isVerifiedFilterEnabled(filters.verified)) {
      query.isVerified = true;
    }

    const doctors = await Doctor.find(query).populate('userId');
    const doctorUsers = await this.getDoctorUsers(filters);

    const merged = new Map();

    doctors.map((doctor) => this.normalizeDoctorRecord(doctor)).filter(Boolean).forEach((doctor) => {
      const key = this.toDoctorListKey(doctor);
      if (key) {
        merged.set(key, doctor);
      }
    });

    doctorUsers.map((user) => this.mapUserToDoctor(user)).filter(Boolean).forEach((doctor) => {
      const key = this.toDoctorListKey(doctor);
      if (key && !merged.has(key)) {
        merged.set(key, doctor);
      }
    });

    return Array.from(merged.values());
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

    const ensuredDoctor = await this.ensureDoctorRecordByUserId(fallbackUserId);
    if (ensuredDoctor) {
      const updatedFallbackDoctor = await Doctor.findByIdAndUpdate(
        ensuredDoctor._id,
        updates,
        { new: true }
      ).populate('userId');
      return updatedFallbackDoctor;
    }

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

  async uploadIdProof(id, file, requester) {
    if (!file || !file.buffer) {
      const error = new Error('ID proof image is required.');
      error.statusCode = 400;
      throw error;
    }

    const usersCollection = mongoose.connection.collection('users');

    let doctor = await Doctor.findById(id).populate('userId');
    if (!doctor) {
      const userId = this.toObjectId(id);
      if (userId) {
        doctor = await Doctor.findOne({ userId }).populate('userId');
      }
    }

    const targetUserId = doctor?.userId?._id || doctor?.userId || this.toObjectId(id);

    if (!targetUserId) {
      return null;
    }

    this.assertDoctorCanUpdateTarget(requester, targetUserId);

    const uploadResult = await this.uploadImageToCloudinary(file.buffer, targetUserId);
    const proofUrl = uploadResult?.secure_url || uploadResult?.url;

    if (!proofUrl) {
      const error = new Error('Failed to upload ID proof image.');
      error.statusCode = 500;
      throw error;
    }

    await usersCollection.updateOne(
      { _id: targetUserId, role: 'doctor' },
      {
        $set: {
          idProofUrl: proofUrl,
          updatedAt: new Date(),
        },
      }
    );

    if (doctor) {
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctor._id,
        {
          idProofUrl: proofUrl,
          updatedAt: new Date(),
        },
        { new: true }
      ).populate('userId');

      return updatedDoctor;
    }

    const updatedUser = await usersCollection.findOne({ _id: targetUserId, role: 'doctor' });
    return updatedUser ? this.mapUserToDoctor(updatedUser) : null;
  }

  async addDoctorRating(id, payload, requester) {
    if (!requester || requester.role !== 'patient') {
      const error = new Error('Only patients can submit doctor ratings.');
      error.statusCode = 403;
      throw error;
    }

    const ratingValue = Number(payload?.rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      const error = new Error('Rating must be a number between 1 and 5.');
      error.statusCode = 400;
      throw error;
    }

    const patientId = this.toObjectId(requester.id);
    if (!patientId) {
      const error = new Error('Invalid patient identity in token.');
      error.statusCode = 401;
      throw error;
    }

    let doctor = await Doctor.findById(id).populate('userId');
    if (!doctor) {
      const userId = this.toObjectId(id);
      if (!userId) {
        return null;
      }
      doctor = await Doctor.findOne({ userId }).populate('userId');
      if (!doctor) {
        doctor = await this.ensureDoctorRecordByUserId(userId);
      }
    }

    if (!doctor) {
      return null;
    }

    const review = typeof payload?.review === 'string' ? payload.review.trim() : '';
    const appointmentId = payload?.appointmentId ? String(payload.appointmentId) : undefined;

    const existingIndex = doctor.ratings.findIndex(
      (entry) => String(entry.patientId) === String(patientId)
    );

    if (existingIndex >= 0) {
      doctor.ratings[existingIndex].rating = ratingValue;
      doctor.ratings[existingIndex].review = review;
      if (appointmentId) {
        doctor.ratings[existingIndex].appointmentId = appointmentId;
      }
      doctor.ratings[existingIndex].createdAt = new Date();
    } else {
      doctor.ratings.push({
        patientId,
        appointmentId,
        rating: ratingValue,
        review,
        createdAt: new Date(),
      });
    }

    const total = doctor.ratings.reduce((sum, entry) => sum + Number(entry.rating || 0), 0);
    doctor.ratingCount = doctor.ratings.length;
    doctor.ratingAverage = doctor.ratingCount ? Number((total / doctor.ratingCount).toFixed(1)) : 0;
    doctor.updatedAt = new Date();
    await doctor.save();

    const usersCollection = mongoose.connection.collection('users');
    const targetUserId = doctor.userId?._id || doctor.userId;
    if (targetUserId) {
      await usersCollection.updateOne(
        { _id: targetUserId, role: 'doctor' },
        {
          $set: {
            ratingAverage: doctor.ratingAverage,
            ratingCount: doctor.ratingCount,
            updatedAt: new Date(),
          },
        }
      );
    }

    return Doctor.findById(doctor._id).populate('userId');
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