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
}, { timestamps: false });

module.exports = PatientProfile;
