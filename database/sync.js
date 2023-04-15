/* Run this script with node sync.js after changes to the database model have been made */

// const sequelizeDb = require('./connection');
const Player = require('./models/player');
const Match = require('./models/match');
const HowlingAbyss = require('./models/howlingAbyss');
const Showdown = require('./models/showdown');
const SummonersRift = require('./models/summonersRift');
const TeamNames = require('./models/teamNames');

/* Drops the current database and syncs all of the models */
// sequelizeDb.sync({ force: true });

/* Updates specified models with the changed structure */
Player.sync({ alter: true });
Match.synd({ alter: true });
SummonersRift.sync({ alter: true });
HowlingAbyss.sync({ alter: true });
Showdown.sync({ alter: true });
TeamNames.sync({ alter: true });

