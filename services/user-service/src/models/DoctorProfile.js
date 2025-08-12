// models/DoctorProfile.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const DoctorProfile = sequelize.define('DoctorProfile', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  specialization: DataTypes.STRING,
  certifications: DataTypes.STRING,
  experience: DataTypes.TEXT,
}, { timestamps: false });

module.exports = DoctorProfile;
