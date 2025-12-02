import {
  EmbedBuilder,
  TextChannel,
  type GuildScheduledEvent,
  type PartialGuildScheduledEvent,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildScheduledEventUpdate";

export const event = async (
  client: botClient,
  oldGuildScheduledEvent:
    | GuildScheduledEvent
    | PartialGuildScheduledEvent
    | null,
  newGuildScheduledEvent: GuildScheduledEvent
) => {
  if (!oldGuildScheduledEvent) return;

  const embed = new EmbedBuilder()
    .setColor(config.embed.warn)
    .setAuthor({
      name: newGuildScheduledEvent.creator?.username ?? "",
      iconURL: newGuildScheduledEvent.creator?.displayAvatarURL() ?? "",
    })
    .setFooter({
      text: "Événement modifié",
      iconURL: newGuildScheduledEvent.guild?.iconURL() ?? "",
    })
    .setTimestamp();

  const updated = [];

  if (oldGuildScheduledEvent.name !== newGuildScheduledEvent.name) {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newGuildScheduledEvent.id}\n**Nom** : ${
        oldGuildScheduledEvent.name
      } ${config.emojis.arrow_right} ${
        newGuildScheduledEvent.name
      }\n\n**Date de création** : <t:${Math.floor(
        newGuildScheduledEvent.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(
        newGuildScheduledEvent.createdTimestamp / 1000
      )}:F>)`,
    });
  } else {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newGuildScheduledEvent.id}\n**Nom** : ${
        newGuildScheduledEvent.name
      }\n\n**Date de création** : <t:${Math.floor(
        newGuildScheduledEvent.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(
        newGuildScheduledEvent.createdTimestamp / 1000
      )}:F>)`,
    });
  }

  if (oldGuildScheduledEvent.description !== newGuildScheduledEvent.description)
    embed
      .addFields({
        name: "📤 - Ancienne description",
        value: ">>> " + (oldGuildScheduledEvent.description ?? "Aucune"),
      })
      .addFields({
        name: "📥 - Nouvelle description",
        value: ">>> " + (newGuildScheduledEvent.description ?? "Aucune"),
      });

  if (
    oldGuildScheduledEvent.scheduledStartAt !==
    newGuildScheduledEvent.scheduledStartAt
  )
    updated.push(
      `**Date de commencement** : <t:${Math.floor(
        oldGuildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:R> (<t:${Math.floor(
        oldGuildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:F>) ${config.emojis.arrow_right} <t:${Math.floor(
        newGuildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:R> (<t:${Math.floor(
        newGuildScheduledEvent.scheduledStartTimestamp! / 1000
      )}:F>)`
    );

  if (
    oldGuildScheduledEvent.scheduledEndTimestamp !==
    newGuildScheduledEvent.scheduledEndTimestamp
  )
    updated.push(
      `**Date de fin** : ${
        oldGuildScheduledEvent.scheduledEndTimestamp !== 0
          ? `<t:${Math.floor(
              oldGuildScheduledEvent.scheduledEndTimestamp! / 1000
            )}:R> (<t:${Math.floor(
              oldGuildScheduledEvent.scheduledEndTimestamp! / 1000
            )}:F>)`
          : "Aucune"
      } ${config.emojis.arrow_right} ${
        newGuildScheduledEvent.scheduledEndTimestamp !== 0
          ? `<t:${Math.floor(
              newGuildScheduledEvent.scheduledEndTimestamp! / 1000
            )}:R> (<t:${Math.floor(
              newGuildScheduledEvent.scheduledEndTimestamp! / 1000
            )}:F>)`
          : "Aucune"
      }`
    );

  if (oldGuildScheduledEvent.channel !== newGuildScheduledEvent.channel)
    updated.push(
      `**Salon** : ${oldGuildScheduledEvent.channel ?? "Aucun"} \`${
        oldGuildScheduledEvent.channel?.name ?? "Aucun"
      }\` ${config.emojis.arrow_right} ${
        newGuildScheduledEvent.channel ?? "Aucun"
      } \`${newGuildScheduledEvent.channel?.name ?? "Aucun"}\``
    );

  if (
    oldGuildScheduledEvent.entityMetadata?.location !==
    newGuildScheduledEvent.entityMetadata?.location
  )
    updated.push(
      `**Lieu** : ${
        oldGuildScheduledEvent.entityMetadata?.location ?? "Aucun"
      } ${config.emojis.arrow_right} ${
        newGuildScheduledEvent.entityMetadata?.location ?? "Aucun"
      }`
    );

  if (
    oldGuildScheduledEvent.coverImageURL() !==
      newGuildScheduledEvent.coverImageURL() &&
    newGuildScheduledEvent.coverImageURL()
  ) {
    updated.push(`**Image** : Modifiée`);
    embed.setImage(newGuildScheduledEvent.coverImageURL({ size: 4096 }));
  }

  if (updated.length === 0) return;

  embed.addFields({
    name: "✏️ - Informations modifiées",
    value: ">>> " + updated.join("\n"),
  });

  // - Status

  const channel = (await client.channels.fetch(
    "1445513101029146745"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
