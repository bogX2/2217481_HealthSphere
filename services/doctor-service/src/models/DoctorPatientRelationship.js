const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const DoctorPatientRelationship = sequelize.define('DoctorPatientRelationship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'rejected', 'terminated'),
    defaultValue: 'pending',
    allowNull: false
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  respondedAt: {
    type: DataTypes.DATE
  },
  terminatedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'doctor_patient_relationships',
  timestamps: false
});

module.exports = DoctorPatientRelationship;