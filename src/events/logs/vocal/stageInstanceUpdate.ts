import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type StageInstance,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "stageInstanceUpdate";

export const event = async (
  client: botClient,
  oldStageInstance: StageInstance | null,
  newStageInstance: StageInstance
) => {
  if (!oldStageInstance || oldStageInstance.topic === newStageInstance.topic)
    return;

  const log = (
    await newStageInstance.guild!.fetchAuditLogs({
      type: AuditLogEvent.StageInstanceUpdate,
      limit: 1,
    })
  ).entries.first();
  const user = log?.executor;
  const embed = new EmbedBuilder()
    .setColor(config.embed.warn)
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newStageInstance.id}\n**Salon** : ${newStageInstance.channel} \`${newStageInstance.channel?.name}\`\n**Sujet** : ${oldStageInstance.topic} ${config.emojis.arrow_right} ${newStageInstance.topic}`,
    })
    .setFooter({
      iconURL: newStageInstance.guild?.iconURL() ?? "",
      text: "Conférence modifiée",
    })
    .setTimestamp();

  if (user) {
    embed.addFields({
      name: "🎊 - Animateur",
      value: `>>> **ID** : ${user.id}\n**Pseudo** : ${user} \`${user.username}\``,
    });
  } else {
    embed.addFields({
      name: "🎊 - Animateur",
      value: `> Impossible de trouver l'animateur qui a modifié la conférence`,
    });
  }
  const channel = (await client.channels.fetch(
    "1443680371379015720"
  )) as TextChannel;
  await channel.send({ embeds: [embed] });
};
