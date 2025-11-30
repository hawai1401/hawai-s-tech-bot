import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type GuildEmoji,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "emojiDelete";

export const event = async (client: botClient, emoji: GuildEmoji) => {
  const log = (
    await emoji.guild.fetchAuditLogs({
      type: AuditLogEvent.EmojiDelete,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setThumbnail(emoji.imageURL({ size: 4096 }))
    .addFields({
      name: "🔧  - Informations sur l'émoji",
      value: `>>> **ID** : ${emoji.id}\n**Nom** : ${
        emoji.name
      }\n**Créé** <t:${Math.floor(
        emoji.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>)`,
    })
    .setColor(config.embed.error)
    .setFooter({ text: "Émoji supprimé", iconURL: emoji.guild.iconURL() ?? "" })
    .setTimestamp();

  if (createur) {
    embed
      .setAuthor({
        name: createur.username,
        iconURL: createur.displayAvatarURL(),
      })
      .addFields({
        name: "🛡️ - Administrateur",
        value: `>>> **ID** : ${createur.id}\n**Pseudo** : ${createur} \`${createur.username}\``,
      });
  } else {
    embed.addFields({
      name: "🛡️ - Administrateur",
      value: `> ${config.emojis.error} - Impossible de trouver l'administrateur qui a supprimé cet émoji.`,
    });
  }

  const channel = (await client.channels.fetch(
    "1418126820871770186"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
