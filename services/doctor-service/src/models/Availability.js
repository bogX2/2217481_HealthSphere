const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

/*
A simple availability model. Each row represents a recurring or one-off slot depending on 'type'.
- type: 'recurring' | 'single'
- recurring: { dayOfWeek: 1..7, start: "09:00", end: "12:00" }
- single: { date: 'YYYY-MM-DD', start:'09:00', end:'10:00' }
*/
const Availability = sequelize.define('Availability', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('recurring','single'), allowNull: false },
  data: { type: DataTypes.JSONB, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: false
});

module.exports = Availability;
