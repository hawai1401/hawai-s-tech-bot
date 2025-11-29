import {
  Invite,
  EmbedBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import erreurMsg from "../../functions/errorMsg.js";

export const data = {
  name: "info-invitation",
  alias: ["ii"],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
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
  if (!args[0]) return erreurMsg("Invitation invalide !", message);
  const invitation: Invite | null = await new Promise(async (res) => {
    try {
      res(await client.fetchInvite(args[0]!));
    } catch {
      res(null);
    }
  });
  if (!invitation) return erreurMsg("Invitation invalide !", message);
  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
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
          value: `>>> **ID** : ${invitation.inviterId}`,
        }),
    ],
  });
};
