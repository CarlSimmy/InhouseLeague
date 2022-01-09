const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const currentPlayers = require('../lists/currentPlayers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('Outputs a list of players who have joined the current game.'),
  async execute(interaction) {
    const playerListEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Active players in the current game:')
      .setDescription(
        currentPlayers.map(player => `**${player.name}** *(${player.mmr})*`).join().replaceAll(',', '\n')
        || 'No players have joined yet.',
      );

    interaction.reply({ embeds: [playerListEmbed] });
  },
};
