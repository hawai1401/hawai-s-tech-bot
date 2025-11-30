import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type GuildEmoji,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "emojiUpdate";

export const event = async (
  client: botClient,
  oldEmoji: GuildEmoji,
  newEmoji: GuildEmoji
) => {
  if (oldEmoji.name === newEmoji.name) return;
  const log = (
    await newEmoji.guild.fetchAuditLogs({
      type: AuditLogEvent.EmojiUpdate,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setThumbnail(newEmoji.imageURL({ size: 4096 }))
    .addFields({
      name: "🔧  - Informations sur l'émoji",
      value: `>>> **ID** : ${newEmoji.id}\n**Nom** : ${oldEmoji.name} ${config.emojis.arrow_right} ${newEmoji.name}`,
    })
    .setColor(config.embed.warn)
    .setFooter({
      text: "Émoji modifié",
      iconURL: newEmoji.guild.iconURL() ?? "",
    })
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
      value: `> ${config.emojis.error} - Impossible de trouver l'administrateur qui a modifié cet émoji.`,
    });
  }

  const channel = (await client.channels.fetch(
    "1418126820871770186"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
