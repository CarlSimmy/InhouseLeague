const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const stats = require('../lists/stats.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Check the inhouse LoL leaderboard to see the top players.'),
  async execute(interaction) {
    const sortedStats = [];
    for (const player in stats.players) {
      sortedStats.push({ id: player, name: stats.players[player].name, mmr: stats.players[player].mmr });
    }

    sortedStats.sort((a, b) => b.mmr - a.mmr);

    const leaderboardEmbed = new EmbedBuilder()
      .setColor('#d4af37')
      .setTitle('Leaderboard')
      .setDescription(
        `${sortedStats.map((player, index) => `**${index + 1}. ${player.name}**  *(${player.mmr})*`).join().replaceAll(',', '\n')}`,
      )
      .setFooter({ text: `Total games played: ${stats.games.totalPlayed}` });

    interaction.reply({ embeds: [leaderboardEmbed] });
  },
};
