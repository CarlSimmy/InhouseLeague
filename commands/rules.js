import { EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

import getGameModeColors from '../shared/getGameModeColors.js';
import getGameModeInfo from '../shared/getGameModeInfo.js';

export const data = new SlashCommandBuilder()
  .setName('rules')
  .setDescription('Check the inhouse LoL rules.')
  .addStringOption(option => option.setName('gamemode')
    .setDescription('Outputs the rules for a specific game mode.')
    .addChoices(
      { name: 'Showdown', value: 'showdown' },
      { name: 'Howling Abyss', value: 'howlingAbyss' },
      { name: 'Summoner\'s Rift', value: 'summonersRift' },
    )
    .setRequired(true),
  );
export async function execute(interaction) {
  const chosenGameMode = interaction.options.getString('gamemode');
  const gameModeIcon = getGameModeInfo(chosenGameMode).icon;


  function getShowdownRules() {
    const rules = `
**Game type**
Howling Abyss or Summoner's Rift
Blind Pick

**Win conditions**
- Get First blood (or first to 2 kills if both players agree beforehand)
- Get a creep score of 100
- Destroy the first tower
      `;

    return rules;
  }

  function getHowlingAbyssRules() {
    const rules = `
**Game type**
Howling Abyss
Tournament draft

**Summoner spell rules**
All summoner spells picked in a team must be *unique*, i.e. only one flash per team and so on.

**Banned items**
- Anathema's Chains <:anathemas:1099052047992627231>
- Guardian's Blade <:blade:1099052051176116326>
- Guardian's Hammer <:hammer:1099052053063532685>
- Guardian's Horn <:horn:1099052054695120986>
- Guardian's Orb <:orb:1099052059912843434>

**Banned champions**
- Aatrox <:AatroxSquare:1099052046826606692>
- Anivia <:anivia:1099052049997512704>
- Morgana <:morgana:1099075079243038750>
- Nasus <:nasus:1099052058369327144>
- Taric <:taric:1099052062781747250>
- Trundle <:trundle:1099064061964066948>
- Yorick <:yorick:1099065707129487491>
      `;

    return rules;
  }

  function getSummonersRiftRules() {
    const rules = 'No rules are currently specified for this game mode.';

    return rules;
  }

  function getGameModeRules() {
    switch (chosenGameMode) {
    case 'showdown':
      return getShowdownRules();
    case 'howlingAbyss':
      return getHowlingAbyssRules();
    case 'summonersRift':
      return getSummonersRiftRules();
    }
  }

  const rulesEmbed = new EmbedBuilder()
    .setColor(getGameModeColors(chosenGameMode))
    .setTitle(`${gameModeIcon} __${getGameModeInfo(chosenGameMode).name} Rules__`)
    .setDescription(getGameModeRules());

  interaction.reply({ embeds: [rulesEmbed] });
}
