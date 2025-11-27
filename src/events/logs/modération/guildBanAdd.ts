import {
  AuditLogEvent,
  EmbedBuilder,
  type GuildBan,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildBanAdd";

export const event = async (client: botClient, ban: GuildBan) => {
  const log = (
    await ban.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberBanAdd,
      user: ban.user,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log?.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setColor(config.embed.success)
    .setThumbnail(ban.user.displayAvatarURL())
    .addFields({
      name: "👤 - Utilisateur",
      value: `>>> **ID** : ${ban.user.id}\n**Pseudo** : ${ban.user} \`${ban.user.username}\``,
    })
    .setFooter({
      text: "Nouveau bannissement",
      iconURL: ban.guild.iconURL()!,
    })
    .setTimestamp();

  if (createur) {
    embed
      .setAuthor({
        name: createur.username,
        iconURL: createur.displayAvatarURL(),
      })
      .addFields({
        name: "🛡️ - Modérateur",
        value: `>>> **ID** : ${createur.id}\n**Pseudo** : ${createur} \`${createur.username}\``,
      });
  } else {
    embed.addFields({
      name: "🛡️ - Modérateur",
      value: `> ${config.emojis.error} - Impossible de trouver le modérateur de ce bannissement.`,
    });
  }
  if ((log && log.reason) || ban.reason)
    embed.addFields({
      name: "✏️ - Raison",
      value: `>>> ${log && log.reason ? log.reason : ban.reason}`,
    });

  const channel = (await client.channels.fetch(
    "1443662056745210097"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
