const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

class AuthService {
  generateResetOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  hashOtp(otp) {
    return crypto.createHash('sha256').update(String(otp)).digest('hex');
  }

  async register(userData) {
    const { name, email, password, role, specialization } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userPayload = { name, email, password: hashedPassword, role };
    if (role === 'doctor' && specialization) {
      userPayload.specialization = specialization;
    }
    const user = new User(userPayload);
    await user.save();
    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }

    const otp = this.generateResetOtp();
    user.resetPasswordOtpHash = this.hashOtp(otp);
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.updatedAt = new Date();
    await user.save();

    try {
      await emailService.sendPasswordResetOtpEmail(user.email, otp, user.name);
    } catch (error) {
      // Keep forgot-password response non-blocking so users can still continue with OTP if delivery is delayed.
      console.error('Password reset OTP email dispatch failed:', error.message);
    }

    return true;
  }

  async verifyPasswordResetOtp(email, otp) {
    const user = await User.findOne({
      email,
      resetPasswordOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired OTP');
    }

    if (user.resetPasswordOtpHash !== this.hashOtp(otp)) {
      throw new Error('Invalid or expired OTP');
    }

    return true;
  }

  async resetPassword(email, otp, newPassword) {
    await this.verifyPasswordResetOtp(email, otp);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    return true;
  }
}

module.exports = new AuthService();