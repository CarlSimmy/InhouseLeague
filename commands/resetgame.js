import { SlashCommandBuilder } from '@discordjs/builders';

import activeGame from '../lists/activeGame.js';
import deleteAfterSecondsDelay from '../shared/deleteAfterDelay.js';

export const data = new SlashCommandBuilder()
  .setName('resetgame')
  .setDescription('Resets the active game.');
export async function execute(interaction) {
  activeGame.players.length = 0;

  interaction.reply({ content: 'The current game has been successfully reset.' }).then(msg => deleteAfterSecondsDelay(msg, 30));
}
