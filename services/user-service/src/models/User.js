const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const PatientProfile = require('./PatientProfile');
const DoctorProfile = require('./DoctorProfile');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {                   
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '' // Provide a default for existing rows
  },
  lastName: {                    
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '' // Provide a default for existing rows
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] }
  },
  role: {
    type: DataTypes.ENUM('patient', 'doctor', 'admin'),
    allowNull: false,
    defaultValue: 'patient'
  },
  phoneNumber: {                  
    type: DataTypes.STRING,
    allowNull: true
  },
  birthDate: {                   
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  birthPlace: {                   
    type: DataTypes.STRING,
    allowNull: true
  },
  fiscalCode: {                  
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  // flexible profile store for first/last names, address, etc.
  profile: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      // hash password if it changed
      if (user.changed && user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['isActive'] }
  ]
});

// instance method to compare password
User.prototype.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.hasOne(PatientProfile, { foreignKey: 'userId' });
PatientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(DoctorProfile, { foreignKey: 'userId' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId' });

module.exports = User;

