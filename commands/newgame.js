import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import activeGame from '../lists/activeGame.js';
import Player from '../database/models/player.js';
import getGameModeInfo from '../shared/getGameModeInfo.js';
import sequelizeDb from '../database/connection.js';

// The models are used dynamically
/* eslint-disable no-unused-vars */
import Showdown from '../database/models/showdown.js';
import HowlingAbyss from '../database/models/howlingAbyss.js';
import SummonersRift from '../database/models/summonersRift.js';
/* eslint-disable no-unused-vars */

export const data = new SlashCommandBuilder()
  .setName('newgame')
  .setDescription('Starts a new LoL inhouse game.')
  .addStringOption(option => option.setName('gamemode')
    .setDescription('The game mode that should be played.')
    .addChoices(
      { name: 'Showdown', value: 'showdown' },
      { name: 'Howling Abyss', value: 'howlingAbyss' },
      { name: 'Summoner\'s Rift', value: 'summonersRift' },
    )
    .setRequired(true),
  );
export async function execute(interaction) {
  if (activeGame.players.length) {
    return interaction.reply({ content: 'A game is already active, use the "/resetgame" command first if you want to start another game.' });
  }

  const chosenGameMode = interaction.options.getString('gamemode');
  const gameModeInfo = getGameModeInfo(chosenGameMode);

  activeGame.gameMode = gameModeInfo;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('join')
      .setLabel('Join')
      .setStyle(ButtonStyle.Primary),
  );

  const message = await interaction.reply({
    content: `Press the button below to join the next ${gameModeInfo.name} game. (0/${gameModeInfo.maxPlayers})`,
    components: [row],
    fetchReply: true,
  });

  const filter = async (userInteraction) => {
    const user = userInteraction.user;

    if (activeGame.players.find(player => player.id === user.id)) {
      await userInteraction.deferReply();
      await userInteraction.editReply({ content: `${user}, it looks like you've already joined.`, ephemeral: true });
      return false;
    }

    return true;
  };

  const collector = message.createMessageComponentCollector({
    filter,
    max: gameModeInfo.maxPlayers,
    time: 15 * 60000,
  });

  // When a user has pressed the join button
  collector.on('collect', async (btnInteraction) => {
    const playerId = btnInteraction.user.id;
    const playerName = btnInteraction.user.username;
    const gameModePlayer = await sequelizeDb.models[chosenGameMode].findOne({ where: { playerId: playerId } });
    const dbPlayer = await Player.findByPk(playerId);

    if (!dbPlayer) {
      await Player.create({
        id: playerId,
        name: playerName,
        totalWins: 0,
        totalLosses: 0,
      });
    }

    if (!gameModePlayer) {
      await sequelizeDb.models[chosenGameMode].create({
        wins: 0,
        losses: 0,
        rating: 1200,
        playerId: playerId,
      });
    }

    // Add player to the current round
    activeGame.players.push({ id: playerId, name: playerName, rating: gameModePlayer?.rating ?? 1200 });

    btnInteraction.reply({
      content: `You joined the game ${btnInteraction.user}!`,
      ephemeral: true,
    });

    message.edit(`Press the button below to join the next ${gameModeInfo.name} game. (${activeGame.players.length}/${gameModeInfo.maxPlayers})`);
  });

  // TODO: Fix so I don't have to type length + 1
  collector.on('end', () => {
    if (activeGame.players.length + 1 === gameModeInfo.maxPlayers) {
      message.reply(`Round is full, use the "/startgame" command when everyone is ready! (${activeGame.players.length + 1}/${gameModeInfo.maxPlayers})`);
    }
    row.components[0].setDisabled(true);

    // Edit message button with new disabled state
    message.edit({ components: [row] });
  });
}
