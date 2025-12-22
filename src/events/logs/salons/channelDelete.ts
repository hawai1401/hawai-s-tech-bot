import {
  AuditLogEvent,
  CategoryChannel,
  ChannelType,
  EmbedBuilder,
  type DMChannel,
  type NonThreadGuildBasedChannel,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "channelDelete";

export const event = async (
  client: botClient,
  channel: DMChannel | NonThreadGuildBasedChannel
) => {
  if (channel.isDMBased()) return;
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
  const log = (
    await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
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
      value: `>>> **ID** : ${channel.id}\n**Nom** : \`${
        channel.name
      }\`\n**Type** : ${channelTypes[channel.type]}\n**Créé** <t:${Math.floor(
        channel.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(channel.createdTimestamp / 1000)}:F>)`,
    })
    .setTimestamp();

  if (channel instanceof CategoryChannel) {
    embed
      .addFields({
        name: "🔧 - Avancé",
        value: `>>> **Position** : ${channel.position + 1}/${
          channel.guild.channels.cache.filter(
            (c) => c.type === ChannelType.GuildCategory
          ).size + 1
        }`,
      })
      .setFooter({
        text: `Catégorie supprimée`,
        iconURL: channel.guild.iconURL() ?? "",
      });
  } else {
    embed
      .addFields({
        name: "🔧 - Avancé",
        value: `>>> **NSFW** : ${
          channel.nsfw ? config.emojis.success : config.emojis.error
        }\n**Position** : ${channel.position + 1}/${
          channel.parent
            ? channel.parent.children.cache.size + 1
            : channel.guild.channels.cache.filter(
                (c) => !c.parent && c.type !== ChannelType.GuildCategory
              ).size + 1
        }\n**Catégorie** : ${
          channel.parent
            ? `${channel.parent} \`${channel.parent.name}\``
            : "Aucune"
        }`,
      })
      .setFooter({
        text: `Salon supprimé`,
        iconURL: channel.guild.iconURL() ?? "",
      });
  }

  const channelLog = (await client.channels.fetch(
    "1413832003941306469"
  )) as TextChannel;
  channelLog.send({ embeds: [embed] });
};
