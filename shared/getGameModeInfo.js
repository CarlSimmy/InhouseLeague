/* Mapping the passed in game mode from options to a static object with extended information. */

const getGameModeInfo = (gameMode) => {
  let staticGameModeInformation = {};

  switch (gameMode) {
  case 'showdown':
    staticGameModeInformation = { name: 'Showdown', value: gameMode, maxPlayers: 2, icon: '<:showdown:1099079556209590342>' };
    break;
  case 'howlingAbyss':
    staticGameModeInformation = { name: 'Howling Abyss', value: gameMode, maxPlayers: 10, icon: '<:howlingabyss:1099075801799987220>' };
    break;
  case 'summonersRift':
    staticGameModeInformation = { name: 'Summoner\'s Rift', value: gameMode, maxPlayers: 10, icon: '<:summonersrift:1099076478974578698>' };
    break;
  }

  return staticGameModeInformation;
};

export default getGameModeInfo;