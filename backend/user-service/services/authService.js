const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
}

module.exports = new AuthService();