import { EmbedBuilder, type ButtonInteraction } from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import ms from "ms";
import config from "../../../config.json" with { type: "json" }

export const event = async (
  client: botClient,
  interaction: ButtonInteraction
) => {
  await interaction.deferUpdate();
  const member = await interaction.guild!.members.fetch(
    interaction.customId.split("_")[2]!
  );
  const nouvelle_duree = Number(interaction.customId.split("_")[3]);
  const raison = interaction.customId.split("_")[4]!;

  try {
    await member.disableCommunicationUntil(nouvelle_duree);
  } catch {
    return erreur("Le membre n'est plus sur le serveur !", interaction, {
      isDefered: true,
    });
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setDescription(
          `### <:coche:1408551329026146334> - La durée a été modifié avec succès !`
        )
        .setFields(
          {
            name: ":outbox_tray: - Fin",
            value: `\`\`\`${new Date(nouvelle_duree).toLocaleString()}\`\`\``,
          },
          {
            name: ":stopwatch: - Durée",
            value: `\`\`\`${ms(
              new Date(nouvelle_duree).getTime() - Date.now(),
              { long: true }
            )}\`\`\``,
          },
          { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
        )
        .setColor(config.embed.success)
        .setFooter({
          text: `Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp(),
    ],
    components: [],
  });
};
