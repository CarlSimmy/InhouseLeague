const Sequelize = require('sequelize');

const sequelizeDb = require('../connection');
const Player = require('./player');

/* Match history for all played games */
const Match = sequelizeDb.define('match', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  team1: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  team2: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gameMode: {
    type: Sequelize.ENUM('showdown', 'howlingAbyss', 'summonersRift'),
    allowNull: false,
  },
  team1RatingChange: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  team2RatingChange: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

Match.belongsToMany(Player, { through: 'MatchPlayer' });
Player.belongsToMany(Match, { through: 'MatchPlayer' });

module.exports = Match;