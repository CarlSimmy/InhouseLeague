const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const EloRating = require('elo-rating');
const fs = require('fs');

const { userId } = require('../config.json');
const greedyPartitioning = require('../functions/greedyPartitioning');
const currentPlayers = require('../lists/currentPlayers');
const nameTable = require('../lists/nameTable');
const stats = require('../lists/stats.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startgame')
    .setDescription('Initiate and create teams for the current inhouse game.'),
  async execute(interaction) {
    if (currentPlayers.length !== 10) {
      interaction.reply({ content: '10 players need to join before you can start the game.' });
      return;
    }

    const numberOfTeams = 2;
    const createdTeams = greedyPartitioning(currentPlayers, numberOfTeams);
    const blueTeam = { team: createdTeams[0], totalMmr: createdTeams[0].reduce((sum, { mmr }) => sum + mmr, 0) };
    const redTeam = { team: createdTeams[1], totalMmr: createdTeams[1].reduce((sum, { mmr }) => sum + mmr, 0) };

    const blueTeamLeader = redTeam.team[Math.floor(Math.random() * redTeam.team.length)];
    const redTeamLeader = blueTeam.team[Math.floor(Math.random() * blueTeam.team.length)];

    const blueTeamEmbed = new MessageEmbed()
      .setColor('#4752c4')
      .setTitle(`__${blueTeamLeader.name}'s ${nameTable[Math.floor(Math.random() * nameTable.length)]}__`)
      .setDescription(
        `**Spelare:**
        ${blueTeam.team.map(player => player.name).join().replaceAll(',', '\n')}`,
      )
      .setFooter({ text: `Calculated MMR: ${blueTeam.totalMmr}` });

    const redTeamEmbed = new MessageEmbed()
      .setColor('#d53b3e')
      .setTitle(`__${redTeamLeader.name}'s ${nameTable[Math.floor(Math.random() * nameTable.length)]}__`)
      .setDescription(
        `**Spelare:**
        ${redTeam.team.map(player => player.name).join().replaceAll(',', '\n')}`,
      )
      .setFooter({ text: `Calculated MMR: ${redTeam.totalMmr}` });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('blue-wins')
        .setLabel('Blue Team Wins')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('red-wins')
        .setLabel('Red Team Wins')
        .setStyle('DANGER'),
    );

    const message = await interaction.reply({
      embeds: [blueTeamEmbed, redTeamEmbed],
      components: [row],
      fetchReply: true,
    });

    // Only team leaders and me can click the buttons to report result.
    const filter = async (userInteraction) => {
      if (userInteraction.user.id === blueTeamLeader.id || userInteraction.user.id === redTeamLeader.id || userInteraction.user.id === userId) {
        return true;
      }

      await userInteraction.deferReply();
      await userInteraction.editReply({ content: 'Only team leaders can report the game result.', ephemeral: true });
      return false;
    };

    const collector = message.createMessageComponentCollector({
      filter,
      max: 1,
      time: 120 * 60000,
    });

    collector.on('collect', btnInteraction => {
      if (btnInteraction.customId === 'blue-wins') {
        blueTeamEmbed.setAuthor({ name: 'WINNERS!' });
        redTeamEmbed.setAuthor({ name: 'LOSERS!' });
        const result = EloRating.calculate(blueTeam.totalMmr, redTeam.totalMmr, true, 40);
        const eloChange = result.playerRating - blueTeam.totalMmr;

        blueTeam.team.forEach(player => {
          stats[player.id].mmr += eloChange;
          stats[player.id].wins += 1;
        });

        redTeam.team.forEach(player => {
          stats[player.id].mmr -= eloChange;
          stats[player.id].losses += 1;
        });

        btnInteraction.reply({
          content: `${blueTeamEmbed.title} defeats ${redTeamEmbed.title}, GG WP!
*Rating change -> ${eloChange}*`,
        });
      }
      else {
        redTeamEmbed.setAuthor({ name: 'WINNERS!' });
        blueTeamEmbed.setAuthor({ name: 'LOSERS!' });
        const result = EloRating.calculate(blueTeam.totalMmr, redTeam.totalMmr, false, 40);
        const eloChange = result.opponentRating - redTeam.totalMmr;

        redTeam.team.forEach(player => {
          stats[player.id].mmr += eloChange;
          stats[player.id].wins += 1;
        });

        blueTeam.team.forEach(player => {
          stats[player.id].mmr -= eloChange;
          stats[player.id].losses += 1;
        });

        btnInteraction.reply({
          content: `${redTeamEmbed.title} defeats ${blueTeamEmbed.title}, GG WP!
*Rating change -> ${eloChange}*`,
        });
      }

      fs.writeFile(__dirname + '/../lists/stats.json', JSON.stringify(stats), err => {
        err && console.log(`Error when writing to text file: ${err}`);
      });
    });

    collector.on('end', () => {
      currentPlayers.length = 0;
      row.components.forEach(button => button.setDisabled(true));

      // Edit message button with new desiabled state
      message.edit({ embeds: [blueTeamEmbed, redTeamEmbed], components: [row] });
    });
  },
};
