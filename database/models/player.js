const Sequelize = require('sequelize');
const sequelizeDb = require('../connection');

const Player = sequelizeDb.define('player', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  totalWins: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalLosses: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Player;