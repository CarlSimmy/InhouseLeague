import { INTEGER } from 'sequelize';

import sequelizeDb from '../connection.js';
import Player from './player.js';

/* Howling Abyss refers to games played on that specific map. ARAM rules game mode usually played 2v2 or 3v3 */
const HowlingAbyss = sequelizeDb.define('howlingAbyss', {
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

HowlingAbyss.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(HowlingAbyss);

export default HowlingAbyss;