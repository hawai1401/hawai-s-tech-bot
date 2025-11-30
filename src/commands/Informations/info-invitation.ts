import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  Invite,
  EmbedBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" };

export const name = "info-invitation";
export const description = "Donne des informations sur une invitation.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .addStringOption((o) =>
    o
      .setName("invitation")
      .setDescription(
        "L'invitation dont vous souhaitez connaître les informations. (https://discord.gg/xxx)"
      )
      .setRequired(true)
      .setMinLength(19)
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();
  const channelTypes = {
    0: "Textuel",
    1: "Message Privé",
    2: "Vocal",
    3: "Groupe Message Privé",
    4: "Catégorie",
    5: "Annonce",
    10: "Fils de nouveauté",
    11: "Fils Publique",
    12: "Fils Privé",
    13: "Conférence",
    14: "GuildDirectory",
    15: "Forum",
    16: "Média",
  };
  const invitation: Invite | null = await new Promise(async (res) => {
    try {
      res(
        await client.fetchInvite(
          interaction.options.getString("invitation", true)
        )
      );
    } catch {
      res(null);
    }
  });
  if (!invitation) return erreur("Invitation invalide !", interaction);
  const inviteur = await client.users
    .fetch(invitation.inviterId!)
    .catch(() => null);
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
        .setThumbnail(inviteur?.displayAvatarURL() ?? "")
        .addFields({
          name: "🔗 - Invitation",
          value: `>>> **Salon** : \`${
            invitation.channel!.name
          }\`\n**Type de salon** : ${channelTypes[invitation.channel!.type]}\n${
            invitation.uses
              ? `**Nombre d'utilisation** : ${invitation.uses}/${
                  invitation.maxUses ? invitation.maxUses : "♾️"
                }`
              : ""
          }`,
        })
        .addFields({
          name: "ℹ️ - Serveur",
          value: `>>> **ID** : ${invitation.guild!.id}\n**Nom** : ${
            invitation.guild!.name
          }\n**Description** : _${
            invitation.guild?.description
              ? invitation.guild.description
              : config.emojis.error
          }_\n**Créé** <t:${Math.floor(
            invitation.guild!.createdTimestamp / 1000
          )}:R> (<t:${Math.floor(
            invitation.guild!.createdTimestamp / 1000
          )}:F>)\n**Membres** : ${invitation.memberCount} (${
            invitation.presenceCount
          } en ligne)`,
        })
        .addFields({
          name: "👤 - Inviteur",
          value: `>>> **ID** : ${invitation.inviterId}\n**Pseudo** : ${
            inviteur?.username ?? "Inconnu"
          }`,
        }),
    ],
  });
};
