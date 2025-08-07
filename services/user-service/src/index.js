require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

// Test connessione DB
sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('DB connection error:', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

module.exports = { sequelize };
