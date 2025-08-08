const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('patient', 'doctor', 'admin'), defaultValue: 'patient' }
});

//User.sync(); // crea la tabella se non esiste

module.exports = User;
//    console.log('Connected to PostgreSQL');