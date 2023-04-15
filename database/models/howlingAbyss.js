const Sequelize = require('sequelize');

const sequelizeDb = require('../connection');
const Player = require('./player');

/* Howling Abyss refers to games played on that specific map. ARAM rules game mode usually played 2v2 or 3v3 */
const HowlingAbyss = sequelizeDb.define('howlingAbyss', {
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

HowlingAbyss.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(HowlingAbyss);

module.exports = HowlingAbyss;