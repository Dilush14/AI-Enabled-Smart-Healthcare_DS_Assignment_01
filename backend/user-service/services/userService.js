const User = require('../models/User');

class UserService {
  async getProfile(userId) {
    return await User.findById(userId);
  }

  async updateProfile(userId, updates) {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
  }
}

module.exports = new UserService();