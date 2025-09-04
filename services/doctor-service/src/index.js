require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const doctorRoutes = require('./routes/doctor');
const path = require('path');
const promBundle = require('express-prom-bundle');

const internalRoutes = require('./routes/internal');

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
app.use(cors({
  origin: 'http://localhost:3001', // dominio del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.json());

const PORT = process.env.PORT || 8082;

const MAX_RETRIES = 12;
const RETRY_INTERVAL = 2500;

async function connectWithRetry() {
  let retries = MAX_RETRIES;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Connected to PostgreSQL (doctor-service)');
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

    // require models after DB available to avoid circular imports
    require('./models/Doctor');
    require('./models/DoctorDocument');
    require('./models/Availability');
    require('./models/DoctorPatientRelationship');

    await sequelize.sync({ alter: true });
    console.log('Doctor DB synced');

    app.use('/api/internal', internalRoutes);

    // serve uploads statically (for demo only; in prod serve from S3/secure)
    const uploadsPath = path.resolve(__dirname, '../uploads');
    app.use('/uploads', express.static(uploadsPath));

    app.use('/api/doctors', doctorRoutes);

    //app.use('/internal', internalRoutes);

    app.get('/health', (req, res) => res.json({ status: 'Doctor Service running', port: PORT }));

    app.listen(PORT, () => console.log(`Doctor Service listening on ${PORT}`));
  } catch (err) {
    console.error('Unable to start doctor-service:', err);
    process.exit(1);
  }
})();
