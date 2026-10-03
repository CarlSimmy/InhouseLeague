import { SlashCommandBuilder } from '@discordjs/builders';
import { createDraft, getDraft, startTurn } from '../shared/draftManager.js';
import { safe, sendTemp } from '../shared/messageUtils.js';
import deleteAfterSecondsDelay from '../shared/deleteAfterDelay.js';

export const data = new SlashCommandBuilder()
  .setName('startpickban')
  .setDescription('Start a new draft.');

export async function execute(interaction) {
  if (getDraft(interaction.channelId)) {
    return interaction.reply({
      content: 'A draft is already running in this channel!',
    }).then(msg => deleteAfterSecondsDelay(msg, 30));
  }

  await interaction.deferReply({ ephemeral: true });
  await safe(interaction.deleteReply());

  const draft = createDraft(interaction.channelId);
  const PHASE_DIVIDER = '\n────────────────────────\n';

  await sendTemp(interaction.channel, 'Draft initiated');
  await sendTemp(
    interaction.channel,
    `${PHASE_DIVIDER}Starting **First BAN phase**${PHASE_DIVIDER}`,
  );

  await startTurn(draft, interaction.channel);
}