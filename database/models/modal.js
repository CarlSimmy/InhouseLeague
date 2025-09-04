import {ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle,} from 'discord.js';

export async function run({ interaction }) {
  const modal = new ModalBuilder({
    customId: `myModal`,
    title: 'Länka League till discord',
  });

  const summonerInput = new TextInputBuilder({
    customId: 'summonerName',
    label: 'Vem du? (Summoner Name)',
    style: TextInputStyle.Short,
  });

  const tagLineInput = new TextInputBuilder({
    customId: 'tagLine',
    label: 'Vem du? #(riot tag, ex EUW)',
    style: TextInputStyle.Short,
  });

  const firstAction = new ActionRowBuilder().addComponents(summonerInput);
  const secondAction = new ActionRowBuilder().addComponents(tagLineInput);

  modal.addComponents(firstAction, secondAction);

  await interaction.showModal(modal);

  try {
    const modalInteraction = await interaction.awaitModalSubmit({
      filter: (i) =>
        i.customId === 'myModal' && i.user.id === interaction.user.id,
      time: 60000,
    });

    const summonerValue =
      modalInteraction.fields.getTextInputValue('summonerName');
    const tagLineValue =
      modalInteraction.fields.getTextInputValue('tagLine');

    await modalInteraction.reply({
      content: `Du registrerade: **${summonerValue} #${tagLineValue}**`,
      ephemeral: true,
    });

    return { summonerName: summonerValue, tagLine: tagLineValue };
  } catch (err) {
    console.log('Modal error:', err);
    return null;
  }
}

const data = {
  name: 'showmodal',
  description: 'Add League account',
};

export default { run, data };