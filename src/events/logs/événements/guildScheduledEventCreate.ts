import {
  EmbedBuilder,
  GuildScheduledEventEntityType,
  TextChannel,
  type GuildScheduledEvent,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildScheduledEventCreate";

export const event = async (
  client: botClient,
  guildScheduledEvent: GuildScheduledEvent
) => {
  const embed = new EmbedBuilder()
    .setColor(config.embed.success)
    .setAuthor({
      name: guildScheduledEvent.creator?.username ?? "",
      iconURL: guildScheduledEvent.creator?.displayAvatarURL() ?? "",
    })
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${guildScheduledEvent.id}\n**Nom** : ${
        guildScheduledEvent.name
      }\n**Description** : _${
        guildScheduledEvent.description?.slice(0, 500) ?? "Aucune"
      }_${
        guildScheduledEvent.description &&
        guildScheduledEvent.description.length > 500
          ? "..."
          : ""
      }\n\n**Lieu** : ${
        guildScheduledEvent.entityType ===
        GuildScheduledEventEntityType.External
          ? guildScheduledEvent.entityMetadata!.location
          : `${guildScheduledEvent.channel} \`${
              guildScheduledEvent.channel!.name
            }\``
      }\n**Date de création** : <t:${Math.floor(
        guildScheduledEvent.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(
        guildScheduledEvent.createdTimestamp / 1000
      )}:F>)\n**Date de commencement** : <t:${Math.floor(
        guildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:R> (<t:${Math.floor(
        guildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:F>)\n**Date de fin** : ${
        guildScheduledEvent.scheduledEndTimestamp
          ? `<t:${Math.floor(
              guildScheduledEvent.scheduledEndTimestamp / 1000
            )}:R> (<t:${Math.floor(
              guildScheduledEvent.scheduledEndTimestamp / 1000
            )}:F>)`
          : "_Non saisie_"
      }\n\n**Lien** : ${guildScheduledEvent.url}\n**Récurrent** : ${
        guildScheduledEvent.recurrenceRule
          ? config.emojis.success
          : config.emojis.error
      }`,
    })
    .setImage(guildScheduledEvent.coverImageURL({ size: 4096 }))
    .setFooter({
      text: "Événement créé",
      iconURL: guildScheduledEvent.guild?.iconURL() ?? "",
    })
    .setTimestamp();

  const channel = (await client.channels.fetch(
    "1445513101029146745"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
