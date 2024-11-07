import { SlashCommandBuilder } from '@discordjs/builders';

import deleteAfterSecondsDelay from '../shared/deleteAfterDelay.js';
import activeGame from '../lists/activeGame.js';

export const data = new SlashCommandBuilder()
  .setName('setteam')
  .setDescription('Add players to the selected team.')
  .addStringOption(option => option.setName('team')
    .setDescription('Which team the players should be added to.')
    .addChoices(
      { name: 'Blue team', value: 'blue' },
      { name: 'Red team', value: 'red' },
    )
    .setRequired(true),
  )
  .addStringOption(option => option.setName('players')
    .setDescription('Input players as comma separated numbers based on /players list (1, 3, 6).')
    .setRequired(true),
  );
export async function execute(interaction) {
  if (activeGame.players.length === 0) {
    return interaction.reply({
      content: 'Not a valid player to set a team for!',
    }).then(msg => deleteAfterSecondsDelay(msg, 30));
  }

  const optionsTeam = interaction.options.getString('team');
  const optionsPlayers = interaction.options.getString('players');
  const playerNumberArray = optionsPlayers.split(',');
  const addedPlayerNames = [];

  playerNumberArray.forEach(playerNumber => {
    activeGame.teams[optionsTeam].push(activeGame.players[playerNumber - 1]);
    addedPlayerNames.push(activeGame.players[playerNumber - 1].name);
  });

  return interaction.reply({
    content: `Added players to the ${optionsTeam} team: **${addedPlayerNames.join(', ')}**`,
    ephemeral: true,
  }).then(msg => deleteAfterSecondsDelay(msg, 30));

}
