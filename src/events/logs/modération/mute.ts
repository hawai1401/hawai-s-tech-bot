import {
  AuditLogEvent,
  EmbedBuilder,
  type GuildMember,
  type PartialGuildMember,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };
import ms from "ms";

export const type = "guildMemberUpdate";

export const event = async (
  client: botClient,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember
) => {
  if (
    oldMember.communicationDisabledUntilTimestamp ===
    newMember.communicationDisabledUntilTimestamp
  )
    return;
  const log = (
    await newMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberUpdate,
      limit: 1,
    })
  ).entries.first();
  const moderateur = log?.executorId
    ? await client.users.fetch(log?.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setThumbnail(newMember.user.displayAvatarURL())
    .addFields({
      name: "👤 - Utilisateur",
      value: `>>> **ID** : ${newMember.user.id}\n**Pseudo** : ${newMember.user} \`${newMember.user.username}\``,
    })
    .setTimestamp();

  if (moderateur) {
    embed
      .setAuthor({
        name: moderateur.username,
        iconURL: moderateur.displayAvatarURL(),
      })
      .addFields({
        name: "🛡️ - Modérateur",
        value: `>>> **ID** : ${moderateur.id}\n**Pseudo** : ${moderateur} \`${moderateur.username}\``,
      });
  } else {
    embed.addFields({
      name: "🛡️ - Modérateur",
      value: `> ${config.emojis.error} - Impossible de trouver le modérateur de ce mute.`,
    });
  }
  if (log && log.reason)
    embed.addFields({
      name: "✏️ - Raison",
      value: `>>> ${log.reason}`,
    });
  if (!oldMember.communicationDisabledUntilTimestamp) {
    embed
      .setColor(config.embed.success)
      .setFooter({
        text: "Member rendu muet",
        iconURL: newMember.guild.iconURL()!,
      })
      .addFields({
        name: "⌛ - Durée",
        value: `\`\`\`${ms(
          newMember.communicationDisabledUntilTimestamp! - Date.now(),
          {
            long: true,
          }
        )}\`\`\``,
      });
  } else {
    embed.setColor(config.embed.error).setFooter({
      text: "Member plus muet",
      iconURL: newMember.guild.iconURL()!,
    });
  }

  const channel = (await client.channels.fetch(
    "1443662056745210097"
  )) as TextChannel;
  return await channel.send({ embeds: [embed] });
};
