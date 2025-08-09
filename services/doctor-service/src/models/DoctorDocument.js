const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const DoctorDocument = sequelize.define('DoctorDocument', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  originalName: { type: DataTypes.STRING },
  mimeType: { type: DataTypes.STRING },
  purpose: { type: DataTypes.STRING }, // e.g., 'license', 'degree'
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: false
});

module.exports = DoctorDocument;
