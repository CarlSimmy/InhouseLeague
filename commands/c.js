import { SlashCommandBuilder } from '@discordjs/builders';
import {
  getDraft,
  applySelection,
  isCorrectPlayer,
  draftOrder,
} from '../shared/draftManager.js';
import { safe } from '../shared/messageUtils.js';

export const data = new SlashCommandBuilder()
  .setName('c')
  .setDescription('Pick or ban a champion')
  .addStringOption((option) =>
    option
      .setName('champion')
      .setDescription('Search champion')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(interaction) {
  const draft = getDraft(interaction.channelId);

  if (!draft) return interaction.respond([]);

  const focused = interaction.options.getFocused();

  let results;

  if (!focused) {
    results = draft.available.slice(0, 5);
  } else {
    results = draft.fuse
      .search(focused)
      .map((r) => r.item)
      .filter((champ) => draft.available.some((c) => c.id === champ.id))
      .slice(0, 5);
  }

  await interaction.respond(
    results.map((champ) => ({
      name: champ.name,
      value: champ.id,
    }))
  );
}

export async function execute(interaction) {
  const draft = getDraft(interaction.channelId);

  if (!draft) {
    return interaction.reply({
      content: 'No active draft.',
      ephemeral: true,
    });
  }

  const turn = draftOrder[draft.phaseIndex];

  if (!turn) {
    return interaction.reply({
      content: 'Draft finished.',
      ephemeral: true,
    });
  }

  if (!isCorrectPlayer(interaction.user.id, turn.team)) {
    return interaction.reply({
      content: "It's not your teams turn.",
      ephemeral: true,
    });
  }

  if (draft.pickInProgress) {
    return interaction.reply({
      content: 'A pick or ban is already in progress.',
      ephemeral: true,
    });
  }

  const championId = interaction.options.getString('champion');
  const champion = draft.available.find((c) => c.id === championId);

  if (!champion) {
    return interaction.reply({
      content: 'Champion already picked, banned or invalid.',
      ephemeral: true,
    });
  }

  // Lock command for picks/bans if one is already processing in the bot.
  draft.pickInProgress = true;

  try {
    await interaction.deferReply({ ephemeral: true });
    await applySelection(draft, interaction.channel, champion);
    await safe(interaction.deleteReply());
  } finally {
    draft.pickInProgress = false;
  }
}
