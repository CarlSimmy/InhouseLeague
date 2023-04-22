const { Sequelize } = require('sequelize');

const sequelizeDb = new Sequelize('yourDbName', 'yourDbUser', 'yourDbPassword', {
  host: 'yourDbHost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',

  define: {
    freezeTableName: true,
  },
});

module.exports = sequelizeDb;