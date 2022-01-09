const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const stats = require('../lists/stats.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Check your inhouse LoL profile.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Outputs the profile for the selected user.')
        .setRequired(false)),
  async execute(interaction) {
    const optionsUser = interaction.options.getUser('user');
    const defaultUser = interaction.user;

    if (optionsUser && !stats[optionsUser?.id]?.mmr) {
      interaction.reply({ content: `${optionsUser} have not played any games yet.` });
      return;
    }

    const mmr = optionsUser ? stats[optionsUser?.id]?.mmr : stats[defaultUser?.id]?.mmr;
    const wins = optionsUser ? stats[optionsUser?.id]?.wins : stats[defaultUser?.id]?.wins;
    const losses = optionsUser ? stats[optionsUser?.id]?.losses : stats[defaultUser?.id]?.losses;
    const winrate = Math.round((wins / (wins + losses)) * 100) + '%';

    const sortedStats = [];
    for (const player in stats) {
      sortedStats.push({ id: player, mmr: stats[player].mmr });
    }

    sortedStats.sort((a, b) => b.mmr - a.mmr);

    const currentRank = `${sortedStats.findIndex(player => optionsUser ? player.id === optionsUser?.id : player.id === defaultUser?.id) + 1} / ${sortedStats.length}`;

    const profileEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${optionsUser?.username || interaction.member.user.username}'s stats`)
      .addFields(
        { name: 'MMR', value: mmr?.toString() || '1000' },
        { name: 'Current ranking', value: currentRank || 'No games recorded yet.' },
        { name: 'Wins', value: wins?.toString() || 'No wins recorded yet.', inline: true },
        { name: 'Losses', value: losses?.toString() || 'No losses recorded yet.', inline: true },
        { name: 'Winrate', value: winrate?.toString(), inline: true },
      );

    interaction.reply({ embeds: [profileEmbed] });
  },
};
