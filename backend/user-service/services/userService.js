const User = require('../models/User');

class UserService {
  async getProfile(userId) {
    return await User.findById(userId);
  }

  async updateProfile(userId, updates) {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
  }

  async getAllUsers() {
    return await User.find({}, '-password').sort({ createdAt: -1 });
  }
}

module.exports = new UserService();