const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const notificationRoutes = require('./routes/notifications');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});