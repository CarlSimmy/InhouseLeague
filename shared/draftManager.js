import { EmbedBuilder } from 'discord.js';
import Fuse from 'fuse.js';
import champions from '../lists/champions.js';
import activeGame from '../lists/activeGame.js';
import { safe, sendTemp } from './messageUtils.js';

export const activeDrafts = new Map();

const TEAM_EMOJI = {
  blue: '🔵',
  red: '🔴',
};

const ACTION_EMOJI = {
  BAN: '🚫',
  PICK: '✅',
};

const TEAM_COLOR = {
  blue: 0x3b82f6,
  red: 0xef4444,
};

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth'];

const PHASE_DIVIDER = '\n────────────────────────\n';

export const draftOrder = [
  { team: 'blue', type: 'BAN' },
  { team: 'red', type: 'BAN' },
  { team: 'blue', type: 'BAN' },
  { team: 'red', type: 'BAN' },
  { team: 'blue', type: 'BAN' },
  { team: 'red', type: 'BAN' },

  { team: 'blue', type: 'PICK' },
  { team: 'red', type: 'PICK' },
  { team: 'red', type: 'PICK' },
  { team: 'blue', type: 'PICK' },
  { team: 'blue', type: 'PICK' },
  { team: 'red', type: 'PICK' },

  { team: 'blue', type: 'BAN' },
  { team: 'red', type: 'BAN' },
  { team: 'blue', type: 'BAN' },
  { team: 'red', type: 'BAN' },

  { team: 'red', type: 'PICK' },
  { team: 'blue', type: 'PICK' },
  { team: 'blue', type: 'PICK' },
  { team: 'red', type: 'PICK' },
];

export function createDraft(channelId) {

  const fuse = new Fuse(champions, {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'nicknames', weight: 0.3 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });

  const draft = {
    channelId,
    phaseIndex: 0,
    available: [...champions],
    bluePicks: [],
    redPicks: [],
    banned: [],
    fuse,
    timer: null,
    timerMessage: null,
    nextTurnExtended: false,
    pickInProgress: false,
  };

  activeDrafts.set(channelId, draft);
  return draft;
}

export function getDraft(channelId) {
  return activeDrafts.get(channelId);
}

export function endDraft(channelId) {
  activeDrafts.delete(channelId);
}

export function isCorrectPlayer(userId, team) {
  return activeGame.teams[team].some(p =>
    p.id === userId.toString(),
  );
}

function getActionNumber(draft, team, type) {

  let count = 0;

  for (let i = 0; i < draft.phaseIndex; i++) {
    const step = draftOrder[i];

    if (step.team === team && step.type === type) {
      count++;
    }
  }

  return count + 1;
}

export async function startTurn(draft, channel) {

  const turn = draftOrder[draft.phaseIndex];

  if (!turn) {
    await finishDraft(draft, channel);
    return;
  }

  const actionNumber = getActionNumber(draft, turn.team, turn.type);
  const ordinal = ORDINAL[actionNumber - 1] ?? `${actionNumber}th`;

  const baseTime = 40000;
  const extraTime = draft.nextTurnExtended ? 15000 : 0;
  const totalTime = baseTime + extraTime;

  draft.nextTurnExtended = false;

  const endTimestamp = Math.floor((Date.now() + totalTime) / 1000);

  await sendTemp(
    channel,
    `\n\n${TEAM_EMOJI[turn.team]} **${turn.team.toUpperCase()} Team** — ${ACTION_EMOJI[turn.type]} **${turn.type}** your ${ordinal} champion`,
  );

  const timerMsg = await channel.send(
    `⏳ **${turn.type}** ends <t:${endTimestamp}:R>`,
  );

  draft.timerMessage = timerMsg;

  draft.timer = setTimeout(() => {
    handleTimeout(draft, channel);
  }, totalTime);
}

function clearTimers(draft) {
  clearTimeout(draft.timer);
}

async function handleTimeout(draft, channel) {

  const random =
    draft.available[Math.floor(Math.random() * draft.available.length)];

  await applySelection(draft, channel, random, true);
}

export async function applySelection(draft, channel, champion, isTimeout = false) {

  if (draft.timerMessage) {
    try {
      await safe(draft.timerMessage.delete());
    }
    catch {
      draft.timerMessage = null;
    }
  }

  clearTimers(draft);

  const turn = draftOrder[draft.phaseIndex];

  draft.available = draft.available.filter(c => c.id !== champion.id);

  if (turn.type === 'BAN') {
    draft.banned.push(champion);
  }
  else if (turn.team === 'blue') {draft.bluePicks.push(champion);}
  else {draft.redPicks.push(champion);}

  const embed = new EmbedBuilder()
    .setTitle(
      `${TEAM_EMOJI[turn.team]}  ${turn.team.toUpperCase()} TEAM ${turn.type}`,
    )
    .setDescription(
      `${ACTION_EMOJI[turn.type]}  ${champion.name}` +
    (isTimeout ? ' (Random)' : ''),
    )
    .setThumbnail(champion.icon)
    .setColor(TEAM_COLOR[turn.team]);

  await sendTemp(channel, { embeds: [embed] });
  await sendTemp(channel, '\u200B');

  draft.phaseIndex++;

  if (draft.phaseIndex === 6) {
    await sendFirstBanSummary(draft, channel);
    await sendTemp(channel, `${PHASE_DIVIDER}Starting **First PICK phase**${PHASE_DIVIDER}`);
    draft.nextTurnExtended = true;
  }

  if (draft.phaseIndex === 12) {
    await sendFirstPickSummary(draft, channel);
    await sendTemp(channel, `${PHASE_DIVIDER}Starting **Second BAN phase**${PHASE_DIVIDER}`);
    draft.nextTurnExtended = true;
  }

  if (draft.phaseIndex === 16) {
    await sendAllBansSummary(draft, channel);
    await sendTemp(channel, `${PHASE_DIVIDER}Starting **Second PICK phase**${PHASE_DIVIDER}`);
    draft.nextTurnExtended = true;
  }

  await startTurn(draft, channel);
}

async function sendFirstBanSummary(draft, channel) {

  const embed = new EmbedBuilder()
    .setTitle('First phase **BANS**')
    .setDescription(draft.banned.map(c => `• ${c.name}`).join('\n'));

  await sendTemp(channel, { embeds: [embed] });
  await sendTemp(channel, '\u200B');
}

async function sendFirstPickSummary(draft, channel) {

  const blueEmbed = new EmbedBuilder()
    .setTitle(`${TEAM_EMOJI['blue']} Blue Team **PICKS**`)
    .setDescription(draft.bluePicks.map(c => `• ${c.name}`).join('\n'))
    .setColor(TEAM_COLOR.blue);

  const redEmbed = new EmbedBuilder()
    .setTitle(`${TEAM_EMOJI['red']} Red Team **PICKS**`)
    .setDescription(draft.redPicks.map(c => `• ${c.name}`).join('\n'))
    .setColor(TEAM_COLOR.red);

  await sendTemp(channel, { embeds: [blueEmbed, redEmbed] });
  await sendTemp(channel, '\u200B');
}

async function sendAllBansSummary(draft, channel) {

  const embed = new EmbedBuilder()
    .setTitle('All **BANS**')
    .setDescription(draft.banned.map(c => `• ${c.name}`).join('\n'));

  await channel.send({ embeds: [embed] });
  await channel.send('\u200B');
}

async function finishDraft(draft, channel) {

  const blueEmbed = new EmbedBuilder()
    .setTitle(`${TEAM_EMOJI['blue']}  **Blue Team**`)
    .setDescription(draft.bluePicks.map(c => `• ${c.name}`).join('\n'))
    .setColor(TEAM_COLOR.blue);

  const redEmbed = new EmbedBuilder()
    .setTitle(`${TEAM_EMOJI['red']}  **Red Team**`)
    .setDescription(draft.redPicks.map(c => `• ${c.name}`).join('\n'))
    .setColor(TEAM_COLOR.red);

  await channel.send({ embeds: [blueEmbed, redEmbed] });

  endDraft(draft.channelId);
}