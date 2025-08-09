const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200 // Slightly higher for gateway
});
app.use(limiter);

// Service discovery - for now hardcoded, later can use env vars or service registry
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:8081',
  doctor: process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:8082',
  // appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:8083'
};

// Proxy middleware options
const proxyOptions = {
  changeOrigin: true,
  timeout: 5000,
  proxyTimeout: 5000,
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  }
};

// Route to User Service
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  ...proxyOptions,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.user,
  ...proxyOptions,
  pathRewrite: {
    '^/api/users': '/api/users'
  }
}));

// DOCTOR SERVICE routes
app.use('/api/doctors', createProxyMiddleware({
  target: services.doctor,
  ...proxyOptions,
  pathRewrite: { '^/api/doctors': '/api/doctors' }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Catch all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Gateway Error:', error.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:', Object.keys(services));
});