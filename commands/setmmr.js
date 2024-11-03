import { SlashCommandBuilder } from '@discordjs/builders';

import sequelizeDb from '../database/connection.js';
import deleteAfterSecondsDelay from '../shared/deleteAfterDelay.js';
import getGameModeInfo from '../shared/getGameModeInfo.js';

// The models are used dynamically
/* eslint-disable no-unused-vars */
import Showdown from '../database/models/showdown.js';
import HowlingAbyss from '../database/models/howlingAbyss.js';
import SummonersRift from '../database/models/summonersRift.js';
/* eslint-disable no-unused-vars */

export const data = new SlashCommandBuilder()
  .setName('setmmr')
  .setDescription('Set the current mmr of a player.')
  .addUserOption(option => option.setName('user')
    .setDescription('The user for whom the MMR is set.')
    .setRequired(true),
  )
  .addStringOption(option => option.setName('gamemode')
    .setDescription('The game mode for which the MMR is set.')
    .addChoices(
      { name: 'Showdown', value: 'showdown' },
      { name: 'Howling Abyss', value: 'howlingAbyss' },
      { name: 'Summoner\'s Rift', value: 'summonersRift' },
    )
    .setRequired(true),
  )
  .addStringOption(option => option.setName('mmr')
    .setDescription('The MMR number to be set.')
    .setRequired(true),
  );

export async function execute(interaction) {
  const optionsUser = interaction.options.getUser('user');
  const chosenGameMode = interaction.options.getString('gamemode');
  const optionsMmr = interaction.options.getString('mmr');
  const gameModeInfo = getGameModeInfo(chosenGameMode);

  const dbPlayer = await sequelizeDb.models[chosenGameMode].findOne({ where: { playerId: Number(optionsUser.id) } });
  const dbPlayerId = dbPlayer.id;

  await sequelizeDb.models[chosenGameMode].update({ rating: Number(optionsMmr) }, { where: { id: dbPlayerId } });


  return interaction.reply({
    content: `The MMR of ${optionsUser} is now set to **${optionsMmr}** for **${gameModeInfo.name}**.`,
    ephemeral: true,
  }).then(msg => deleteAfterSecondsDelay(msg, 10));

}
