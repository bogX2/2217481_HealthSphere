// models/PatientProfile.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const PatientProfile = sequelize.define('PatientProfile', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  nome: DataTypes.STRING,
  cognome: DataTypes.STRING,
  telefono: DataTypes.STRING,
  dataNascita: DataTypes.DATEONLY,
  luogoNascita: DataTypes.STRING,
  codiceFiscale: DataTypes.STRING,

  // 🔹 Nuovi campi
  medicalHistory: {
    type: DataTypes.TEXT, // TEXT perché può essere lungo
    allowNull: true,
  },
  insuranceDetails: {
    type: DataTypes.STRING, // stringa semplice (es. nome assicurazione, polizza, ecc.)
    allowNull: true,
  },
}, { 
  timestamps: false 
});

module.exports = PatientProfile;
