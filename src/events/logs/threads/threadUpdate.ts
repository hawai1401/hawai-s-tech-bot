import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  type AnyThreadChannel,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import ms from "ms";
import config from "../../../../config.json" with { type: "json" };

export const type = "threadUpdate";

export const event = async (
  client: botClient,
  oldThread: AnyThreadChannel,
  newThread: AnyThreadChannel
) => {
  if (!newThread.parent) return;
  const log = (
    await newThread.guild.fetchAuditLogs({
      type: AuditLogEvent.ThreadUpdate,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executor;
  if (!createur) return;

  const embed = new EmbedBuilder()
    .setColor(config.embed.warn)
    .setAuthor({
      name: createur.username!,
      iconURL: createur.displayAvatarURL(),
    })
    .setTimestamp();

  if (oldThread.name !== newThread.name) {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newThread.id}\n**Nom** : \`${oldThread.name}\` ${
        config.emojis.arrow_right
      } \`${newThread.name}\`\n**Créé** <t:${Math.floor(
        newThread.createdTimestamp! / 1000
      )}:R> (<t:${Math.floor(newThread.createdTimestamp! / 1000)}:F>)`,
    });
  } else {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newThread.id}\n**Nom** : ${newThread} \`${
        newThread.name
      }\`\n**Créé** <t:${Math.floor(
        newThread.createdTimestamp! / 1000
      )}:R> (<t:${Math.floor(newThread.createdTimestamp! / 1000)}:F>)`,
    });
  }

  if (newThread.parent.type === ChannelType.GuildForum) {
    embed.setFooter({
      text: `Post mit à jour`,
      iconURL: newThread.guild.iconURL() ?? "",
    });
  } else {
    embed.setFooter({
      text: `Fil mit à jour`,
      iconURL: newThread.guild.iconURL() ?? "",
    });
  }

  const updated: string[] = [];
  const autoArchiveDuration = {
    60: "1 heure",
    1440: "1 jour",
    4320: "3 jours",
    10080: "1 semaine",
  };

  if (oldThread.rateLimitPerUser !== newThread.rateLimitPerUser)
    updated.push(
      `**Mode lent** : ${
        oldThread.rateLimitPerUser
          ? ms(oldThread.rateLimitPerUser * 1000)
          : "Désactivé"
      } ${config.emojis.arrow_right} ${
        newThread.rateLimitPerUser
          ? ms(newThread.rateLimitPerUser * 1000)
          : "Désactivé"
      }`
    );

  if (
    oldThread.autoArchiveDuration !== newThread.autoArchiveDuration &&
    oldThread.autoArchiveDuration &&
    newThread.autoArchiveDuration
  )
    updated.push(
      `**Période d'inactivité avant masquage** : ${
        autoArchiveDuration[oldThread.autoArchiveDuration]
      } ${config.emojis.arrow_right} ${
        autoArchiveDuration[newThread.autoArchiveDuration]
      }`
    );

  if (oldThread.locked !== newThread.locked)
    updated.push(
      `**Verrouillé** : ${
        oldThread.locked ? config.emojis.success : config.emojis.error
      } ${config.emojis.arrow_right} ${
        newThread.locked ? config.emojis.success : config.emojis.error
      }`
    );

  if (oldThread.archived !== newThread.archived)
    updated.push(
      `**Archivé** : ${
        oldThread.archived ? config.emojis.success : config.emojis.error
      } ${config.emojis.arrow_right} ${
        newThread.archived ? config.emojis.success : config.emojis.error
      }`
    );

  if (updated.length === 0 && oldThread.name === newThread.name) return;

  if (updated.length > 0)
    embed.addFields({
      name: "🔧 - Informations modifiées",
      value: `>>> ${updated.join("\n")}`,
    });

  const channelLog = (await client.channels.fetch(
    "1419651146460696687"
  )) as TextChannel;
  channelLog.send({ embeds: [embed] });
};
