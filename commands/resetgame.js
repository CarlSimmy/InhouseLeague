const { SlashCommandBuilder } = require('@discordjs/builders');

const activeGame = require('../lists/activeGame');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetgame')
    .setDescription('Resets the active game.'),
  async execute(interaction) {
    activeGame.players.length = 0;

    interaction.reply({ content: 'The current game has been successfully reset.' });
  },
};
