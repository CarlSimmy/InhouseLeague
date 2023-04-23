import { STRING, INTEGER } from 'sequelize';

import sequelizeDb from '../connection.js';

const Player = sequelizeDb.define('player', {
  id: {
    type: STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  totalWins: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalLosses: {
    type: INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

export default Player;