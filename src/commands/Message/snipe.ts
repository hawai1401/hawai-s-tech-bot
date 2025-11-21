import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" }

export const name = "snipe";
export const description = "Afficher le dernier message supprimé dans le salon.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const msg = client.snipes.get(interaction.channelId);
  if (!msg)
    return erreur("Aucun message n'a été supprimé dans ce salon.", interaction);
  const user = await client.users.fetch(msg.author!.id);
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
        .setThumbnail(user.displayAvatarURL())
        .addFields({
          name: "👤 - Auteur",
          value: `>>> **Pseudo** : ${user.username}\n**ID** : ${user.id}`,
        })
        .addFields({
          name: "💬 - Contenu",
          value: `\`\`\`${msg.content}\`\`\``,
        })
        .setFooter({
          text: `Demandé par ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp(),
    ],
  });
};
