const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const stats = require('../lists/stats.json');
const currentPlayers = require('../lists/currentPlayers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newgame')
    .setDescription('Starts a new LoL inhouse game for 5v5.'),
  async execute(interaction) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('join')
        .setLabel('Join')
        .setStyle('PRIMARY'),
    );

    const message = await interaction.reply({
      content: 'Press the button below to join the next 5v5 game. (0/10)',
      components: [row],
      fetchReply: true,
    });

    const filter = async (userInteraction) => {
      if (currentPlayers.filter(player => player.id === userInteraction.user.id).length > 0) {
        await userInteraction.deferReply();
        await userInteraction.editReply({ content: `${userInteraction.user}, it looks like you've already joined.`, ephemeral: true });
        return false;
      }
      else if (currentPlayers.length >= 10) {
        await userInteraction.deferReply();
        await userInteraction.editReply({ content: `Sorry ${userInteraction.user}, but the current game is full.`, ephemeral: true });
        return false;
      }

      return true;
    };

    const collector = message.createMessageComponentCollector({
      filter,
      max: 10,
      time: 15 * 60000,
    });

    collector.on('collect', btnInteraction => {
      // Add new player to stats file
      if (!stats.players[btnInteraction.user.id]) {
        stats.players[btnInteraction.user.id] = { name: btnInteraction.user.username, wins: 0, losses: 0, mmr: 1200 };

        fs.writeFile(__dirname + '/../lists/stats.json', JSON.stringify(stats), err => {
          err && console.log(`Error when writing to text file: ${err}`);
        });
      }

      // Add player to the current round
      currentPlayers.push({ id: btnInteraction.user.id, name: btnInteraction.user.username, mmr: stats.players[btnInteraction.user.id].mmr || 1200 });

      btnInteraction.reply({
        content: `You joined the game ${btnInteraction.user}!`,
        ephemeral: true,
      });

      message.edit(`Press the button below to join the next 5v5 game. (${currentPlayers.length}/10)`);
    });

    collector.on('end', () => {
      message.reply('Round is full, use the "startgame" command when everyone is ready! (10/10)');
      row.components[0].setDisabled(true);

      // Edit message button with new desiabled state
      message.edit({ components: [row] });
    });
  },
};
