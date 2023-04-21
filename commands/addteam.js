const { SlashCommandBuilder } = require('@discordjs/builders');

const TeamNames = require('../database/models/teamNames');

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

    await TeamNames.create({
      name: chosenTeamName,
      creatorId: user.id,
      creatorName: user.username,
    });

    return interaction.reply({ content: `The team name **${chosenTeamName}** has been added to the database.` });
  },
};
