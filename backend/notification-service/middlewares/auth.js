const jwt = require('jsonwebtoken');

const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'medikaline-internal-token';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const internalAuth = (req, res, next) => {
  const token = req.header('x-service-token');

  if (token !== INTERNAL_SERVICE_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized service request' });
  }

  next();
};

module.exports = { auth, internalAuth };