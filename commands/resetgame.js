const { SlashCommandBuilder } = require('@discordjs/builders');

const currentPlayers = require('../lists/currentPlayers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetgame')
    .setDescription('Resets the active game.'),
  async execute(interaction) {
    currentPlayers.length = 0;

    interaction.reply({ content: 'The current game has been successfully reset.' });
  },
};
