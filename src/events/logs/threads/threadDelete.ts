import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  type AnyThreadChannel,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "threadDelete";

export const event = async (client: botClient, thread: AnyThreadChannel) => {
  if (!thread.parent) return;
  const log = (
    await thread.guild.fetchAuditLogs({
      type: AuditLogEvent.ThreadDelete,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executor;
  if (!createur) return;

  const embed = new EmbedBuilder()
    .setColor(config.embed.error)
    .setAuthor({
      name: createur.username!,
      iconURL: createur.displayAvatarURL(),
    })
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${thread.id}\n**Nom** : \`${
        thread.name
      }\`\n**Créé** <t:${Math.floor(
        thread.createdTimestamp! / 1000
      )}:R> (<t:${Math.floor(thread.createdTimestamp! / 1000)}:F>)`,
    })
    .setTimestamp();

  if (thread.parent.type === ChannelType.GuildForum) {
    embed
      .addFields({
        name: "🔧 - Avancé",
        value: `>>> **Salon** : ${thread.parent} \`${
          thread.parent.name
        }\`\n**Tags** : ${
          thread.appliedTags.length > 0
            ? "\n" + thread.appliedTags.map((t) => `- ${t}`).join("\n")
            : "Aucun"
        }`,
      })
      .setFooter({
        text: `Post supprimé`,
        iconURL: thread.guild.iconURL() ?? "",
      });
  } else {
    embed
      .addFields({
        name: "🔧 - Avancé",
        value: `>>> **Salon** : ${thread.parent} \`${
          thread.parent.name
        }\`\n**Privé** : ${
          thread.type === ChannelType.PrivateThread
            ? config.emojis.success
            : config.emojis.error
        }`,
      })
      .setFooter({
        text: `Fil supprimé`,
        iconURL: thread.guild.iconURL() ?? "",
      });
  }

  const channelLog = (await client.channels.fetch(
    "1419651146460696687"
  )) as TextChannel;
  channelLog.send({ embeds: [embed] });
};
