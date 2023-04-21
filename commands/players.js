const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelizeDb = require('../database/connection');

const activeGame = require('../lists/activeGame');
const Player = require('../database/models/player');
const getGameModeColors = require('../shared/getGameModeColors');
const getGameModeInfo = require('../shared/getGameModeInfo');

// The models are used dynamically
/* eslint-disable no-unused-vars */
const Showdown = require('../database/models/showdown');
const HowlingAbyss = require('../database/models/howlingAbyss');
const SummonersRift = require('../database/models/summonersRift');
/* eslint-disable no-unused-vars */

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('Outputs a list of players who have joined the current game.'),
  async execute(interaction) {
    if (!activeGame.players.length) {
      return interaction.reply({ content: 'No game is active yet, use the "/newgame" command to start a new game!' });
    }

    const playerInfo = Promise.all(activeGame.players.map(async activePlayer => {
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

    interaction.reply({ embeds: [playerListEmbed] });
  },
};
