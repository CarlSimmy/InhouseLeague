const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const sequelizeDb = require('../database/connection');

const Player = require('../database/models/player');
const getGameModeInfo = require('../shared/getGameModeInfo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Check your inhouse LoL profile.')
    .addStringOption(option =>
      option.setName('gamemode')
        .setDescription('Outputs the profile for the specified game mode.')
        .addChoices(
          { name: 'Showdown', value: 'showdown' },
          { name: 'Howling Abyss', value: 'howlingAbyss' },
          { name: 'Summoner\'s Rift', value: 'summonersRift' },
        )
        .setRequired(false),
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Outputs the profile for the selected user.')
        .setRequired(false),
    ),
  async execute(interaction) {
    const defaultUser = interaction.user;
    const optionsUser = interaction.options.getUser('user');
    const chosenGameMode = interaction.options.getString('gamemode');
    const gameModeInfo = getGameModeInfo(chosenGameMode);
    const playerOverall = await getPlayerOverall();
    const playerForGameMode = await getPlayerForGameMode();

    /* Get the overall stats for a player depending on the user option passed */
    function getPlayerOverall() {
      if (optionsUser) {
        return Player.findByPk(optionsUser.id);
      }

      return Player.findByPk(defaultUser.id);
    }

    /* Get the specific game mode stats for a player depending on the user option passed */
    function getPlayerForGameMode() {
      if (!chosenGameMode) {
        return;
      }

      if (optionsUser) {
        return sequelizeDb.models[chosenGameMode]?.findOne({ where: { playerId: optionsUser.id } });
      }

      return sequelizeDb.models[chosenGameMode]?.findOne({ where: { playerId: defaultUser.id } });
    }

    if (chosenGameMode && !playerForGameMode) {
      return interaction.reply({ content: `${optionsUser || 'You'} ${optionsUser ? 'has' : 'have'} not played any ${gameModeInfo.name} games yet.`, ephemeral: true });
    }

    if (!playerOverall) {
      return interaction.reply({ content: `${optionsUser || 'You'} ${optionsUser ? 'has' : 'have'} not played any ${gameModeInfo.name} games yet.`, ephemeral: true });
    }

    /* Get player standings */
    async function getPlayerStanding() {
      if (!chosenGameMode) {
        return;
      }

      const totalPlayersForGameMode = await sequelizeDb.models[chosenGameMode]?.findAll({ order: [['rating', 'DESC']] });
      const placement = totalPlayersForGameMode.findIndex((stat) => stat.playerId === (optionsUser ? optionsUser.id : defaultUser.id)) + 1;
      return `${placement} / ${totalPlayersForGameMode.length}`;
    }

    /* Get images based on ranks from bronze -> diamond */
    function getRankImage() {
      let rankImage = 'https://i.imgur.com/YEmMdS4.png';

      switch (rating) {
      case (rating >= 0 && rating <= 949):
        rankImage = 'https://i.imgur.com/YEmMdS4.png';
        break;
      case (rating >= 950 && rating <= 1299):
        rankImage = 'https://i.imgur.com/lQV0thv.png';
        break;
      case (rating >= 1300 && rating <= 1649):
        rankImage = 'https://i.imgur.com/NIUCmvx.png';
        break;
      case (rating >= 1650 && rating <= 1999):
        rankImage = 'https://i.imgur.com/Pi6HXZH.png';
        break;
      case (rating >= 2000):
        rankImage = 'https://i.imgur.com/ExCc5g0.png';
        break;
      }

      return rankImage;
    }

    /* Setting player stat variables based on if a gamemode is chosen or not */
    const rating = chosenGameMode ? playerForGameMode.rating : null;
    const wins = chosenGameMode ? playerForGameMode.wins : playerOverall.totalWins;
    const losses = chosenGameMode ? playerForGameMode.losses : playerOverall.totalLosses;
    const winrate = Math.round((wins / (wins + losses)) * 100) || null;
    const playerStanding = await getPlayerStanding();

    const profileEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`${optionsUser?.username || interaction.member.user.username}'s stats`)
      .setImage(getRankImage())
      .addFields(
        { name: 'Rating', value: rating?.toString() || 'No overall rating exists.' },
        { name: 'Current placement', value: playerStanding || 'No overall placement exists.' },
        { name: 'Wins', value: wins?.toString(), inline: true },
        { name: 'Losses', value: losses?.toString(), inline: true },
        { name: 'Winrate', value: winrate ? `${winrate?.toString()} %` : 'N/A', inline: true },
      );

    interaction.reply({ embeds: [profileEmbed], ephemeral: true });
  },
};
