import { SlashCommandBuilder } from "discord.js";
import modalModule from "../database/models/modal.js";
import Summoner from "../database/models/summoner.js"; 

export const data = new SlashCommandBuilder()
  .setName("summoner")
  .setDescription("Länka eller uppdatera ditt League of Legends-konto");

export async function execute(interaction) {
  const modalResult = await modalModule.run({ interaction });

  if (!modalResult) {
    return interaction.followUp({
      content: "länkning avbruten.",
      ephemeral: true,
    });
  }

  const { summonerName, tagLine } = modalResult;
  const playerId = interaction.user.id; 

  try {
    const existingSummoner = await Summoner.findOne({ where: { playerId } });

    if (existingSummoner) {
      await existingSummoner.update({
        summonerName,
        tagLine,
      });

      return interaction.followUp({
        content: `Uppdaterade ditt konto till **${summonerName}#${tagLine}**`,
        ephemeral: true,
      });
    } else {
      await Summoner.create({
        playerId,
        summonerName,
        tagLine,
      });

      return interaction.followUp({
        content: `Länkade nytt konto: **${summonerName} #${tagLine}**`,
        ephemeral: true,
      });
    }
  } catch (err) {
    console.error("Summoner DB error:", err);
    return interaction.followUp({
      content: "Något gick fel vid spara konto.",
      ephemeral: true,
    });
  }
}
