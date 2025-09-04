const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');
const reviewRoutes = require('./routes/reviews');
const promBundle = require('express-prom-bundle');
const app = express();

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);
// Middleware
app.use(cors());
app.use(express.json());

// Connetti al database
connectDB();

// Rotte
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => console.log(`Review service running on port ${PORT}`));