const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

class AuthService {
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    user.updatedAt = new Date();
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendBaseUrl}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink, user.name);

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date();
    await user.save();

    return true;
  }
}

module.exports = new AuthService();