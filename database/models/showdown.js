import { INTEGER } from 'sequelize';

import sequelizeDb from '../connection.js';
import Player from './player.js';

/* Showdown refers to 1v1 games */
const Showdown = sequelizeDb.define('showdown', {
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

Showdown.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(Showdown);

export default Showdown;