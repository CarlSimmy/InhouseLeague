import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import sequelizeDb from '../database/connection.js';

import Player from '../database/models/player.js';
import getGameModeInfo from '../shared/getGameModeInfo.js';

// The models are used dynamically
/* eslint-disable no-unused-vars */
import Showdown from '../database/models/showdown.js';
import HowlingAbyss from '../database/models/howlingAbyss.js';
import SummonersRift from '../database/models/summonersRift.js';
/* eslint-disable no-unused-vars */

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Check the inhouse LoL leaderboard to see the top players for each game mode.')
  .addStringOption(option => option.setName('gamemode')
    .setDescription('Outputs the leaderboard for the specified game mode.')
    .addChoices(
      { name: 'Showdown', value: 'showdown' },
      { name: 'Howling Abyss', value: 'howlingAbyss' },
      { name: 'Summoner\'s Rift', value: 'summonersRift' },
    )
    .setRequired(true),
  );
export async function execute(interaction) {
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
      { name: 'Players', value: await formattedLeaderboard });

  interaction.reply({ embeds: [leaderboardEmbed] });
}
