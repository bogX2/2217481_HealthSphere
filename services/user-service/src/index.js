require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('DB connection error:', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});