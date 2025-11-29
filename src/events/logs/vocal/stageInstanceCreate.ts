import {
  AuditLogEvent,
  EmbedBuilder,
  type StageInstance,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "stageInstanceCreate";

export const event = async (
  client: botClient,
  stageInstance: StageInstance
) => {
  const log = (
    await stageInstance.guild!.fetchAuditLogs({
      type: AuditLogEvent.StageInstanceCreate,
      limit: 1,
    })
  ).entries.first();
  const user = log?.executor;
  const embed = new EmbedBuilder()
    .setColor(config.embed.success)
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${stageInstance.id}\n**Salon** : ${stageInstance.channel} \`${stageInstance.channel?.name}\`\n**Sujet** : ${stageInstance.topic}`,
    })
    .setFooter({
      iconURL: stageInstance.guild?.iconURL() ?? "",
      text: "Conférence commencée",
    })
    .setTimestamp();
  if (stageInstance.guildScheduledEvent) {
    embed
      .setImage(stageInstance.guildScheduledEvent.coverImageURL())
      .addFields({
        name: "📅 - Événement",
        value: `>>> **Nom** : ${
          stageInstance.guildScheduledEvent.name
        }\n**Description** : ${
          stageInstance.guildScheduledEvent.description
            ? `${stageInstance.guildScheduledEvent.description.slice(0, 500)}${
                stageInstance.guildScheduledEvent.description.length > 500
                  ? "..."
                  : ""
              }`
            : "Aucune"
        }\n\n**Créé** <t:${Math.floor(
          stageInstance.guildScheduledEvent.createdTimestamp / 1000
        )}:R> (<t:${Math.floor(
          stageInstance.guildScheduledEvent.createdTimestamp / 1000
        )}:F>)${
          stageInstance.guildScheduledEvent.scheduledStartTimestamp
            ? `\n**Commence** <t:${Math.floor(
                stageInstance.guildScheduledEvent.scheduledStartTimestamp / 1000
              )}:R> (<t:${Math.floor(
                stageInstance.guildScheduledEvent.scheduledStartTimestamp / 1000
              )}:F>)`
            : ""
        }`,
      });
  }
  if (user) {
    embed
      .addFields({
        name: "🎊 - Animateur",
        value: `>>> **ID** : ${user.id}\n**Pseudo** : ${user} \`${user.username}\``,
      })
      .setThumbnail(user.displayAvatarURL());
  } else {
    embed.addFields({
      name: "🎊 - Animateur",
      value: `> Impossible de trouver l'animateur qui a commencé la conférence`,
    });
  }
  const channel = (await client.channels.fetch(
    "1443680371379015720"
  )) as TextChannel;
  await channel.send({ embeds: [embed] });
};
