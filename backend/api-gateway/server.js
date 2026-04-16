const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Proxy to services
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/api/users', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/api/doctors', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/api/appointments', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/telemedicine', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/api/payments', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});