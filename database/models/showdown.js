const Sequelize = require('sequelize');

const sequelizeDb = require('../connection');
const Player = require('./player');

/* Showdown refers to 1v1 games */
const Showdown = sequelizeDb.define('showdown', {
  wins: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  losses: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1200,
  },
});

Showdown.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(Showdown);

module.exports = Showdown;