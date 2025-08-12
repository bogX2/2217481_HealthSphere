require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001', // dominio del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 8081;

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 3000; // 3 seconds

async function connectWithRetry() {
  let retries = MAX_RETRIES;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Connected to PostgreSQL');
      return; // Exit loop on success
    } catch (err) {
      retries -= 1;
      console.error(`DB connection failed: ${err.message}. Retries left: ${retries}`);
      if (!retries) throw err; // Exit if no retries left
      await new Promise(res => setTimeout(res, RETRY_INTERVAL));
    }
  }
}

(async () => {
  try {
    // Wait for DB to be ready
    await connectWithRetry();

    // Sync models
    await sequelize.sync({ alter: true }); // or { force: true } in dev only
    console.log('Database synced');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'User Service is running',
        timestamp: new Date().toISOString(),
        port: PORT
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
