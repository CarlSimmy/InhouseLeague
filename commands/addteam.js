const { SlashCommandBuilder } = require('@discordjs/builders');

const TeamNames = require('../database/models/teamNames');
const { Sequelize } = require('sequelize');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addteam')
    .setDescription('Add a new team name to the database.')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the new team, e.g. "Player\'s YourAddedTeamName"')
        .setRequired(true),
    ),
  async execute(interaction) {
    const user = interaction.user;
    const chosenTeamName = interaction.options.getString('name');
    const dbItem = await TeamNames.findOne({
      where: Sequelize.where(
        // Lower case the row in Sequelize and check it against the lower case option
        Sequelize.fn('lower', Sequelize.col('name')),
        chosenTeamName.toLowerCase(),
      ),
    });

    if (dbItem) {
      return interaction.reply({ content: `Sorry, but the team name **${dbItem.name}** already exists in the database.` });
    }

    await TeamNames.create({
      name: chosenTeamName,
      creatorId: user.id,
      creatorName: user.username,
    });

    return interaction.reply({ content: `The team name **${chosenTeamName}** has been added to the database.` });
  },
};
