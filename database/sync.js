/* Run this script with node sync.js after changes to the database model have been made */

import sequelizeDb from './connection.js';
import Player from './models/player.js';
import Match from './models/match.js';
import HowlingAbyss from './models/howlingAbyss.js';
import Showdown from './models/showdown.js';
import SummonersRift from './models/summonersRift.js';
import TeamNames from './models/teamNames.js';

/* Drops the current database and syncs all of the models */
sequelizeDb.sync({ force: true });

/* Updates specified models with the changed structure */
/* Player.sync({ alter: true });
Match.sync({ alter: true });
SummonersRift.sync({ alter: true });
HowlingAbyss.sync({ alter: true });
Showdown.sync({ alter: true });
TeamNames.sync({ alter: true });*/

