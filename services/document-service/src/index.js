require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const prescriptionRoutes = require('./routes/prescriptions');
const promBundle = require('express-prom-bundle');
const app = express();
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connessione al Database
connectDB();

// Rotte
app.use('/api/prescriptions', prescriptionRoutes);

// Avvio del server
const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`Document-Service running on port ${PORT}`);
});