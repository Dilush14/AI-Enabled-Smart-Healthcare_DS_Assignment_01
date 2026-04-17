const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const app = express();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3002';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003';
const TELEMEDICINE_SERVICE_URL = process.env.TELEMEDICINE_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Proxy to services
app.use('/api/auth', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true }));
app.use('/api/users', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true }));
app.use('/api/doctors', createProxyMiddleware({ target: DOCTOR_SERVICE_URL, changeOrigin: true }));
app.use('/api/appointments', createProxyMiddleware({ target: APPOINTMENT_SERVICE_URL, changeOrigin: true }));
app.use('/api/telemedicine', createProxyMiddleware({ target: TELEMEDICINE_SERVICE_URL, changeOrigin: true }));
app.use('/api/payments', createProxyMiddleware({ target: PAYMENT_SERVICE_URL, changeOrigin: true }));
app.use('/api/notifications', createProxyMiddleware({ target: NOTIFICATION_SERVICE_URL, changeOrigin: true }));
app.use('/uploads', createProxyMiddleware({ target: TELEMEDICINE_SERVICE_URL, changeOrigin: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});