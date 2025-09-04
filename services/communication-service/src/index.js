require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const chatRoutes = require('./routes/chat');
const { initializeSocket } = require('./controllers/messageController');
const http = require('http'); // Needed for Socket.IO
const promBundle = require('express-prom-bundle');
const internalRoutes = require('./routes/internal');

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
// CORS setup (adjust origin for your frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If needed for cookies/tokens
}));

app.use(express.json());

const PORT = process.env.PORT || 8084;

// Routes
app.use('/api/internal', internalRoutes);
app.use('/api/chats', chatRoutes); // Prefix all chat routes with /api/chats

// Basic health check or root route
app.get('/', (req, res) => {
  res.json({ message: 'Communication Service is running' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found in Communication Service' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Communication Service Error:', error.stack);
  res.status(500).json({ error: 'Internal Server Error in Communication Service' });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initializeSocket(server); // Initialize Socket.IO with the HTTP server

// Database connection and server startup
const MAX_RETRIES = 12;
const RETRY_INTERVAL = 2500; // milliseconds

const connectWithRetry = async (retries = 0) => {
  try {
    await sequelize.authenticate();
    console.log('Communication Service connected to database.');
    await sequelize.sync(); // Sync models (create tables if they don't exist)
    console.log('Communication Service database models synchronized.');

    server.listen(PORT, () => {
      console.log(`Communication Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Communication Service database connection error:', error);
    if (retries < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_INTERVAL / 1000} seconds... (${retries + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectWithRetry(retries + 1), RETRY_INTERVAL);
    } else {
      console.error('Max retries reached. Failed to connect to database.');
      process.exit(1); // Exit if cannot connect after retries
    }
  }
};

connectWithRetry();