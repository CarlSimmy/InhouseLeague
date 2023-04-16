const Sequelize = require('sequelize');

const sequelizeDb = require('../connection');
const Player = require('./player');

/* Summoners Rift refers to games played on that specific map. Standard game mode usually played 4v4 or 5v5 */
const SummonersRift = sequelizeDb.define('summonersRift', {
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

SummonersRift.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(SummonersRift);

module.exports = SummonersRift;