import { Sequelize } from 'sequelize';

const sequelizeDb = new Sequelize('yourDbName', 'yourDbUser', 'yourDbPassword', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',

  define: {
    freezeTableName: true,
  },
});

export default sequelizeDb;
