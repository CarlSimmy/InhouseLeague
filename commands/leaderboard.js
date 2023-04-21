const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelizeDb = require('../database/connection');

const Player = require('../database/models/player');
const getGameModeInfo = require('../shared/getGameModeInfo');

// The models are used dynamically
/* eslint-disable no-unused-vars */
const Showdown = require('../database/models/showdown');
const HowlingAbyss = require('../database/models/howlingAbyss');
const SummonersRift = require('../database/models/summonersRift');
/* eslint-disable no-unused-vars */

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Check the inhouse LoL leaderboard to see the top players for each game mode.')
    .addStringOption(option =>
      option.setName('gamemode')
        .setDescription('Outputs the leaderboard for the specified game mode.')
        .addChoices(
          { name: 'Showdown', value: 'showdown' },
          { name: 'Howling Abyss', value: 'howlingAbyss' },
          { name: 'Summoner\'s Rift', value: 'summonersRift' },
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    const chosenGameMode = interaction.options.getString('gamemode');
    const leaderboard = await sequelizeDb.models[chosenGameMode].findAll({ order: [['rating', 'DESC']] });
    const gameModeInfo = getGameModeInfo(chosenGameMode);

    if (!leaderboard.length) {
      return interaction.reply({ content: `No leaderboard exists for ${gameModeInfo.name} yet.` });
    }

    /*
      Formatting the leaderboard for better player output
      1. BestPlayer (1460)
      2. ...
      ...
    */
    const formattedLeaderboard = Promise.all(leaderboard.map(async (player, index) => {
      const placement = index + 1;
      const playerObj = await Player.findByPk(player.playerId);
      const playerName = playerObj.name;
      const playerRating = player.rating;

      return `**${placement}. ${playerName}**  *(${playerRating})*`;
    })).then(info => info.join().replaceAll(',', '\n'));

    const leaderboardEmbed = new EmbedBuilder()
      .setColor('#d4af37')
      .setTitle('__Leaderboard__')
      .addFields(
        { name: 'Game mode', value: `${gameModeInfo.icon} ${gameModeInfo.name}` },
        { name: 'Players', value: await formattedLeaderboard },
      );

    interaction.reply({ embeds: [leaderboardEmbed] });
  },
};
