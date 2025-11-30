import {
  AuditLogEvent,
  EmbedBuilder,
  type GuildEmoji,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "emojiCreate";

export const event = async (client: botClient, emoji: GuildEmoji) => {
  const log = (
    await emoji.guild.fetchAuditLogs({
      type: AuditLogEvent.EmojiCreate,
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
    .setColor(config.embed.success)
    .setFooter({ text: "Émoji créé", iconURL: emoji.guild.iconURL() ?? "" })
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
      value: `> ${config.emojis.error} - Impossible de trouver l'administrateur qui a créé cet émoji.`,
    });
  }

  const channel = (await client.channels.fetch(
    "1418126820871770186"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
