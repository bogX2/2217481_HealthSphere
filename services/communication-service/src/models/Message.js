// Example Message model
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Chats',
      key: 'id'
    }
  },
  senderId: { // User ID of the sender
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Optional: Read status for the recipient
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true, // createdAt will also be used, but timestamp is explicit
  indexes: [
    { fields: ['chatId'] },
    { fields: ['senderId'] },
    { fields: ['timestamp'] }
  ]
});
Message.belongsTo(require('./Chat'), { foreignKey: 'chatId' });
module.exports = Message;