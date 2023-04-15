const Sequelize = require('sequelize');

const sequelizeDb = require('../connection');

/* For keeping and adding team names that are used when playing */
const TeamNames = sequelizeDb.define('teamNames', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  creatorId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  creatorName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = TeamNames;