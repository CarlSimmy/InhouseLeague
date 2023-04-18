const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelizeDb = require('../database/connection');

const activeGame = require('../lists/activeGame');
const Player = require('../database/models/player');

// I am using the models dynamically
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

    const playerInfo = Promise.all(activeGame.players.map(async id => {
      const player = await Player.findByPk(id);
      const gameModePlayer = await sequelizeDb.models[activeGame.gameMode.value].findOne({ where: { playerId: id } });

      return (`${player.name} (${gameModePlayer.rating})`);
    })).then(info => info.join().replaceAll(',', '\n'));

    const playerListEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Active players in the ${activeGame.gameMode.name} game:`)
      .setDescription(await playerInfo || 'No players have joined yet.');

    interaction.reply({ embeds: [playerListEmbed] });
  },
};
