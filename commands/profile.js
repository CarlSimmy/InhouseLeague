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

    if (optionsUser && !stats.players[optionsUser?.id]?.mmr) {
      interaction.reply({ content: `${optionsUser} have not played any games yet.` });
      return;
    }

    const mmr = optionsUser ? stats.players[optionsUser?.id]?.mmr : stats.players[defaultUser?.id]?.mmr;
    const wins = optionsUser ? stats.players[optionsUser?.id]?.wins : stats.players[defaultUser?.id]?.wins;
    const losses = optionsUser ? stats.players[optionsUser?.id]?.losses : stats.players[defaultUser?.id]?.losses;
    const winrate = Math.round((wins / (wins + losses)) * 100) + '%';

    const sortedStats = [];
    for (const player in stats.players) {
      sortedStats.push({ id: player, mmr: stats.players[player].mmr });
    }

    sortedStats.sort((a, b) => b.mmr - a.mmr);

    const currentRank = `${sortedStats.findIndex(player => optionsUser ? player.id === optionsUser?.id : player.id === defaultUser?.id) + 1} / ${sortedStats.length}`;

    function getRankImage() {
      if (mmr >= 0 && mmr <= 949) {
        return 'https://i.imgur.com/YEmMdS4.png';
      }
      else if (mmr >= 950 && mmr <= 1299) {
        return 'https://i.imgur.com/lQV0thv.png';
      }
      else if (mmr >= 1300 && mmr <= 1649) {
        return 'https://i.imgur.com/NIUCmvx.png';
      }
      else if (mmr >= 1650 && mmr <= 1999) {
        return 'https://i.imgur.com/Pi6HXZH.png';
      }
      else if (mmr >= 2000) {
        return 'https://i.imgur.com/ExCc5g0.png';
      }

      return 'https://i.imgur.com/YEmMdS4.png';
    }

    const profileEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${optionsUser?.username || interaction.member.user.username}'s stats`)
      .setImage(getRankImage())
      .addFields(
        { name: 'MMR', value: mmr?.toString() || '1200' },
        { name: 'Current ranking', value: currentRank || 'No games recorded yet.' },
        { name: 'Wins', value: wins?.toString() || 'No wins recorded yet.', inline: true },
        { name: 'Losses', value: losses?.toString() || 'No losses recorded yet.', inline: true },
        { name: 'Winrate', value: winrate?.toString(), inline: true },
      );

    interaction.reply({ embeds: [profileEmbed] });
  },
};
