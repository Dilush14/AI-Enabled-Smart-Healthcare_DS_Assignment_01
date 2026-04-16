const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Attempting to connect to local MongoDB at mongodb://localhost:27017/healthcare');
    try {
      await mongoose.connect('mongodb://localhost:27017/healthcare', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('Connected to local MongoDB');
    } catch (localError) {
      console.error('Local MongoDB connection also failed:', localError.message);
      // Continue anyway - some endpoints might work without DB
      console.warn('WARNING: Database unavailable. Some features may not work.');
    }
  }
};

module.exports = connectDB;