import {
  AuditLogEvent,
  EmbedBuilder,
  Guild,
  type Invite,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "inviteDelete";

export const event = async (client: botClient, invite: Invite) => {
  if (!invite.guild || !(invite.guild instanceof Guild)) return;
  const log = (
    await invite.guild.fetchAuditLogs({
      type: AuditLogEvent.InviteDelete,
      limit: 1,
    })
  ).entries.first();
  const admin = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;
  const embed = new EmbedBuilder()
    .setColor(config.embed.error)
    .addFields({
      name: "🔗 - Invitation",
      value: `>>> **Salon** : ${invite.channel} \`${
        invite.channel!.name
      }\`\n**Lien** : ${invite.url}\n**Temporaire** : ${
        invite.temporary ? config.emojis.success : config.emojis.error
      }`,
    })
    .setFooter({
      text: "Invitation supprimée",
      iconURL: invite.guild?.iconURL() ?? "",
    })
    .setTimestamp();

  if (admin)
    embed.addFields({
      name: "🛡️ - Administrateur",
      value: `>>> **ID** : ${admin.id}\n**Pseudo** : ${admin} \`${admin.username}\``,
    });

  const channel = (await client.channels.fetch(
    "1445024679856181323"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
