import { INTEGER } from 'sequelize';

import sequelizeDb from '../connection.js';
import Player from './player.js';

/* Summoners Rift refers to games played on that specific map. Standard game mode usually played 4v4 or 5v5 */
const SummonersRift = sequelizeDb.define('summonersRift', {
  wins: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  losses: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 1200,
  },
});

SummonersRift.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(SummonersRift);

export default SummonersRift;