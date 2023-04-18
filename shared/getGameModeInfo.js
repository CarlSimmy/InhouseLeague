/* Mapping the passed in game mode from options to a static object with extended information. */

const getGameModeInfo = (gameMode) => {
  let staticGameModeInformation = {};

  switch (gameMode) {
  case 'showdown':
    staticGameModeInformation = { name: 'Showdown', value: gameMode, maxPlayers: 2 };
    break;
  case 'howlingAbyss':
    staticGameModeInformation = { name: 'Howling Abyss', value: gameMode, maxPlayers: 10 };
    break;
  case 'summonersRift':
    staticGameModeInformation = { name: 'Summoner\'s Rift', value: gameMode, maxPlayers: 10 };
    break;
  }

  return staticGameModeInformation;
};

module.exports = getGameModeInfo;