import { INTEGER,STRING} from 'sequelize';

import sequelizeDb from '../connection.js';
import Player from './player.js';

const Summoner = sequelizeDb.define('summoner', {
  summonerName: {
    type: STRING,
    allowNull: false,
    defaultValue: 'UNnamed',
  },
  tagLine: {
    type: STRING,
    allowNull: false,
    defaultValue: 'UNnamed',
  },
});

Summoner.belongsTo(Player, { foreignKey: 'playerId' });
Player.hasOne(Summoner);

export default Summoner;