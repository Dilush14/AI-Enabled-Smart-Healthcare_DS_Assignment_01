const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/database');
const telemedicineRoutes = require('./routes/telemedicine');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/telemedicine', telemedicineRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Telemedicine service running on port ${PORT}`);
});