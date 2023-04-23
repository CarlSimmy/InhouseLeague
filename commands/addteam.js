import { SlashCommandBuilder } from '@discordjs/builders';

import TeamNames from '../database/models/teamNames.js';
import { Sequelize } from 'sequelize';

export const data = new SlashCommandBuilder()
  .setName('addteam')
  .setDescription('Add a new team name to the database.')
  .addStringOption(option => option.setName('name')
    .setDescription('The new team name, will be written as "Player\'s YourAddedTeamName"')
    .setRequired(true),
  );
export async function execute(interaction) {
  const user = interaction.user;
  const chosenTeamName = interaction.options.getString('name');
  const dbItem = await TeamNames.findOne({
    where: Sequelize.where(
      // Lower case the row in Sequelize and check it against the lower case option
      Sequelize.fn('lower', Sequelize.col('name')),
      chosenTeamName.toLowerCase()),
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
}
