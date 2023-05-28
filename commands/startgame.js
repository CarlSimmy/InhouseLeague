import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import EloRating from 'elo-rating';
import { Sequelize } from 'sequelize';

import sequelizeDb from '../database/connection.js';
import config from '../config.js';
import activeGame from '../lists/activeGame.js';
import Player from '../database/models/player.js';
import TeamNames from '../database/models/teamNames.js';
import createEqualTeams from '../shared/createEqualTeams.js';

// The models are used dynamically
/* eslint-disable no-unused-vars */
import Showdown from '../database/models/showdown.js';
import HowlingAbyss from '../database/models/howlingAbyss.js';
import SummonersRift from '../database/models/summonersRift.js';
/* eslint-disable no-unused-vars */

export const data = new SlashCommandBuilder()
  .setName('startgame')
  .setDescription('Initiate and create teams for the current inhouse game.');
export async function execute(interaction) {
  if (activeGame.players.length === 0) {
    return interaction.reply({ content: 'Get some more players before you start the game!' });
  }

  if (activeGame.players.length % 2 !== 0) {
    return interaction.reply({ content: 'You need an even amount of players to start the game.' });
  }

  const createdTeams = createEqualTeams(activeGame.players);
  const blueTeam = createdTeams[0];
  const redTeam = createdTeams[1];

  blueTeam.name = await TeamNames.findOne({
    order: Sequelize.literal('random()'),
    limit: 1,
    attributes: ['name'],
  }).then(list => list.name);

  // Generate a new name for the red team that is not the same as the name of the blue team
  while (redTeam.name === 'TBD' || redTeam.name === blueTeam.name) {
    redTeam.name = await TeamNames.findOne({
      order: Sequelize.literal('random()'),
      limit: 1,
      attributes: ['name'],
    }).then(list => list.name);
  }

  const blueTeamLeader = blueTeam.players[0];
  const redTeamLeader = redTeam.players[0];

  const blueTeamEmbed = new EmbedBuilder()
    .setColor('#4752c4')
    .setTitle(`__${blueTeamLeader.name}'s ${blueTeam.name}__`)
    .setDescription(
      `**Spelare:**
        ${blueTeam.players.map(player => player.name).join().replaceAll(',', '\n')}`)
    .setFooter({ text: `Calculated MMR: ${blueTeam.totalRating}` });

  const redTeamEmbed = new EmbedBuilder()
    .setColor('#d53b3e')
    .setTitle(`__${redTeamLeader.name}'s ${redTeam.name}__`)
    .setDescription(
      `**Spelare:**
        ${redTeam.players.map(player => player.name).join().replaceAll(',', '\n')}`)
    .setFooter({ text: `Calculated MMR: ${redTeam.totalRating}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('blue-wins')
      .setLabel('Blue Team Wins')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('red-wins')
      .setLabel('Red Team Wins')
      .setStyle(ButtonStyle.Danger));

  const message = await interaction.reply({
    embeds: [blueTeamEmbed, redTeamEmbed],
    components: [row],
    fetchReply: true,
  });

  // Only team leaders and me can click the buttons to report result.
  const filter = async (userInteraction) => {
    if (userInteraction.user.id === blueTeamLeader.id || userInteraction.user.id === redTeamLeader.id || userInteraction.user.id === config.adminUserId) {
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

  const getEloChange = (blueMmr, redMmr, gamesPlayed, isBlueWinner) => {
    const PLACEMENT_FACTOR = 90;
    const ADJUSTMENT_FACTOR = 60;
    const STANDARD_FACTOR = 30;

    let result = EloRating.calculate(blueMmr, redMmr, isBlueWinner, STANDARD_FACTOR);

    if (gamesPlayed < 15) {
      result = EloRating.calculate(blueMmr, redMmr, isBlueWinner, PLACEMENT_FACTOR);
    }
    else if (gamesPlayed >= 15 && gamesPlayed < 25) {
      result = EloRating.calculate(blueMmr, redMmr, isBlueWinner, ADJUSTMENT_FACTOR);
    }

    return (
      (isBlueWinner ? result.playerRating : result.opponentRating) - (isBlueWinner ? blueMmr : redMmr)
    );
  };

  collector.on('collect', btnInteraction => {
    const isBlueWinner = btnInteraction.customId === 'blue-wins' ? true : false;

    activeGame.players.forEach(async (player) => {
      const isBlueTeamPlayer = blueTeam.players.find(blueTeamPlayer => blueTeamPlayer.id === player.id) ? true : false;
      const isBlueTeamPlayerAndWinner = isBlueTeamPlayer && isBlueWinner;
      const isRedTeamPlayerAndWinner = !isBlueTeamPlayer && !isBlueWinner;
      const isPlayerOnWinningTeam = isBlueTeamPlayerAndWinner || isRedTeamPlayerAndWinner;
      const playerId = player.id;
      const gameModePlayer = await sequelizeDb.models[activeGame.gameMode.value].findOne({ where: { playerId: playerId } });
      const totalPlayedGames = gameModePlayer.wins + gameModePlayer.losses;
      const ratingChange = getEloChange(blueTeam.totalRating, redTeam.totalRating, totalPlayedGames, isBlueTeamPlayerAndWinner ? true : false);

      await Player.update(
        {
          totalWins: isPlayerOnWinningTeam ?
            Sequelize.literal('totalWins + 1') :
            Sequelize.literal('totalWins'),

          totalLosses: !isPlayerOnWinningTeam ?
            Sequelize.literal('totalLosses + 1') :
            Sequelize.literal('totalLosses'),
        },
        { where: { id: playerId } },
      );
      await sequelizeDb.models[activeGame.gameMode.value].update(
        {
          rating: isPlayerOnWinningTeam ?
            Sequelize.literal(`rating + ${ratingChange}`) :
            Sequelize.literal(`rating - ${ratingChange}`),

          wins: isPlayerOnWinningTeam ?
            Sequelize.literal('wins + 1') :
            Sequelize.literal('wins'),

          losses: !isPlayerOnWinningTeam ?
            Sequelize.literal('losses + 1') :
            Sequelize.literal('losses'),
        },
        { where: { playerId } },
      );
    });

    blueTeamEmbed.setAuthor({ name: isBlueWinner ? 'WINNERS!' : 'LOSERS!' });
    redTeamEmbed.setAuthor({ name: !isBlueWinner ? 'WINNERS!' : 'LOSERS!' });

    btnInteraction.reply({
      content: isBlueWinner ?
        `${blueTeamEmbed.data.title} defeats ${redTeamEmbed.data.title}` :
        `${redTeamEmbed.data.title} defeats ${blueTeamEmbed.data.title}` +
        ', GG WP!',
    });
  });

  collector.on('end', () => {
    activeGame.players.length = 0;
    row.components.forEach(button => button.setDisabled(true));

    // Edit message button with new disabled state
    message.edit({ embeds: [blueTeamEmbed, redTeamEmbed], components: [row] });
  });
}
