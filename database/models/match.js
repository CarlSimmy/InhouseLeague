import { INTEGER, STRING, ENUM } from 'sequelize';

import sequelizeDb from '../connection.js';
import Player from './player.js';

/* Match history for all played games */
const Match = sequelizeDb.define('match', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  team1: {
    type: STRING,
    allowNull: false,
  },
  team2: {
    type: STRING,
    allowNull: false,
  },
  gameMode: {
    type: ENUM('showdown', 'howlingAbyss', 'summonersRift'),
    allowNull: false,
  },
  team1RatingChange: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  team2RatingChange: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

Match.belongsToMany(Player, { through: 'MatchPlayer' });
Player.belongsToMany(Match, { through: 'MatchPlayer' });

export default Match;