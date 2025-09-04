require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const appointmentRoutes = require('./routes/appointments');
const cors = require('cors');
const promBundle = require('express-prom-bundle');





const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
// Import models
const Appointment = require('./models/Appointment');
const AppointmentSlot = require('./models/AppointmentSlot');

// Initialize associations
Appointment.associate({ AppointmentSlot });
AppointmentSlot.associate({ Appointment });

app.use(cors({
  origin: 'http://localhost:3001', // dominio del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 8083;

const MAX_RETRIES = 12;
const RETRY_INTERVAL = 2500;

async function connectWithRetry() {
  let retries = MAX_RETRIES;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Connected to PostgreSQL (appointment-service)');
      return;
    } catch (err) {
      retries -= 1;
      console.error(`DB connection failed: ${err.message}. Retries left: ${retries}`);
      if (!retries) throw err;
      await new Promise(res => setTimeout(res, RETRY_INTERVAL));
    }
  }
}

(async () => {
  try {
    await connectWithRetry();

    // Require models after DB is connected
    require('./models/Appointment');
    require('./models/AppointmentSlot');

    await sequelize.sync({ alter: true });
    console.log('Appointment DB synced');

    app.use('/api/appointments', appointmentRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'Appointment Service running', port: PORT });
    });

    app.listen(PORT, () => {
      console.log(`Appointment Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start appointment-service:', err);
    process.exit(1);
  }
})();
