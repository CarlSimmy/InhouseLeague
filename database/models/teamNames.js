import { INTEGER, STRING } from 'sequelize';

import sequelizeDb from '../connection.js';

/* For keeping and adding team names that are used when playing */
const TeamNames = sequelizeDb.define('teamNames', {
  id: {
    type: INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
    autoIncrement: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
  creatorId: {
    type: STRING,
    allowNull: false,
  },
  creatorName: {
    type: STRING,
    allowNull: false,
  },
});

export default TeamNames;