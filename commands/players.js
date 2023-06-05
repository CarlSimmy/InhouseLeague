import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import sequelizeDb from '../database/connection.js';
import activeGame from '../lists/activeGame.js';
import Player from '../database/models/player.js';
import getGameModeColors from '../shared/getGameModeColors.js';
import getGameModeInfo from '../shared/getGameModeInfo.js';
import deleteAfterSecondsDelay from '../shared/deleteAfterDelay.js';

// The models are used dynamically
/* eslint-disable no-unused-vars */
import Showdown from '../database/models/showdown.js';
import HowlingAbyss from '../database/models/howlingAbyss.js';
import SummonersRift from '../database/models/summonersRift.js';
/* eslint-disable no-unused-vars */

export const data = new SlashCommandBuilder()
  .setName('players')
  .setDescription('Outputs a list of players who have joined the current game.');
export async function execute(interaction) {
  if (!activeGame.players.length) {
    return interaction.reply({
      content: 'No game is active yet, use the "/newgame" command to start a new game!',
    }).then(msg => deleteAfterSecondsDelay(msg, 30));
  }

  const playerInfo = Promise.all(activeGame.players.map(async (activePlayer) => {
    const player = await Player.findByPk(activePlayer.id);
    const gameModePlayer = await sequelizeDb.models[activeGame.gameMode.value].findOne({ where: { playerId: activePlayer.id } });

    return (`${player.name} (${gameModePlayer.rating})`);
  })).then(info => info.join().replaceAll(',', '\n'));

  const playerListEmbed = new EmbedBuilder()
    .setColor(getGameModeColors(activeGame.gameMode.value))
    .setTitle('__Current game__')
    .addFields(
      { name: 'Game mode', value: `${getGameModeInfo(activeGame.gameMode.value).icon} ${activeGame.gameMode.name}` },
      { name: 'Active players', value: await playerInfo || 'No players have joined yet.' },
    );

  interaction.reply({ embeds: [playerListEmbed] }).then(msg => deleteAfterSecondsDelay(msg, 60));
}
