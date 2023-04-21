/* Used to output different colored Discord embeds based on the game mode */

const getGameModeColors = (gameMode) => {
  let gameModeColor = '';

  switch (gameMode) {
  case 'showdown':
    gameModeColor = '#ea4343';
    break;
  case 'howlingAbyss':
    gameModeColor = '#439cea';
    break;
  case 'summonersRift':
    gameModeColor = '#43ea61';
    break;
  default:
    gameModeColor = '#eab043';
    break;
  }

  return gameModeColor;
};

module.exports = getGameModeColors;