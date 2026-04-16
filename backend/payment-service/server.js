const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const paymentRoutes = require('./routes/payments');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});