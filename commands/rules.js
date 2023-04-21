const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const getGameModeColors = require('../shared/getGameModeColors');
const getGameModeInfo = require('../shared/getGameModeInfo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Check the inhouse LoL rules.')
    .addStringOption(option =>
      option.setName('gamemode')
        .setDescription('Outputs the rules for a specific game mode.')
        .addChoices(
          { name: 'Showdown', value: 'showdown' },
          { name: 'Howling Abyss', value: 'howlingAbyss' },
          { name: 'Summoner\'s Rift', value: 'summonersRift' },
        )
        .setRequired(true),
    ),
  async execute(interaction) {
    const chosenGameMode = interaction.options.getString('gamemode');


    function getShowdownRules() {
      const rules = `
**Game type:**

Summoner's Rift / Howling Abyss
Blind Pick

**Win conditions:**

- Get First blood (or first to 2 kills if both players agree)
- Get a creep score of 100
- Destroy the first tower
      `;

      return rules;
    }

    function getHowlingAbyssRules() {
      const rules = `
**Game type:**

Howling Abyss
Tournament draft

**Summoner spell rules:**

All summoner spells picked in a team must be **unique**, i.e. only one flash per team and so on.

**Banned Items:**

- Anathema's Chains
- Guardian's Blade
- Guardian's Hammer
- Guardian's Horn
- Guardian's Orb

**Banned Champions:**

- Aatrox
- Anivia
- Morgana
- Nasus
- Taric
- Trundle
- Yorick
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
      .setTitle(`__${getGameModeInfo(chosenGameMode).name} Rules__`)
      .setDescription(getGameModeRules());

    interaction.reply({ embeds: [rulesEmbed] });
  },
};
