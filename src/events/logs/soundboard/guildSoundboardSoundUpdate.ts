import {
  AuditLogEvent,
  EmbedBuilder,
  type GuildSoundboardSound,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildSoundboardSoundUpdate";

export const event = async (
  client: botClient,
  oldSoundboardSound: GuildSoundboardSound | null,
  newSoundboardSound: GuildSoundboardSound
) => {
  if (!oldSoundboardSound) return;

  const log = (
    await newSoundboardSound.guild!.fetchAuditLogs({
      type: AuditLogEvent.SoundboardSoundUpdate,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;

  if (!createur) return;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: createur.username,
      iconURL: createur.displayAvatarURL(),
    })
    .setColor(config.embed.warn)
    .setFooter({
      text: "Soundboard mit à jour",
      iconURL: newSoundboardSound.guild!.iconURL() ?? "",
    })
    .setTimestamp();

  if (oldSoundboardSound.name !== newSoundboardSound.name) {
    embed.addFields({
      name: "🔧  - Informations sur le son",
      value: `>>> **ID** : ${newSoundboardSound.soundId}\n**Nom** : ${
        newSoundboardSound.name
      }\n**Émoji similaire** : ${
        newSoundboardSound.emoji ?? "Aucun"
      }\n**Créé** <t:${Math.floor(
        newSoundboardSound.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(newSoundboardSound.createdTimestamp / 1000)}:F>)`,
    });
  } else {
    embed.addFields({
      name: "🔧  - Informations sur le son",
      value: `>>> **ID** : ${newSoundboardSound.soundId}\n**Nom** : ${
        newSoundboardSound.name
      }\n**Émoji similaire** : ${
        newSoundboardSound.emoji ?? "Aucun"
      }\n**Créé** <t:${Math.floor(
        newSoundboardSound.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(newSoundboardSound.createdTimestamp / 1000)}:F>)`,
    });
  }

  const updated: string[] = [];

  if (oldSoundboardSound.emoji !== newSoundboardSound.emoji)
    updated.push(
      `**Émoji similaire** : ${oldSoundboardSound.emoji ?? "Aucun"} ${
        config.emojis.arrow_right
      } ${newSoundboardSound.emoji ?? "Aucun"}`
    );

  if (oldSoundboardSound.volume !== newSoundboardSound.volume)
    updated.push(
      `**Volume** : ${oldSoundboardSound.volume * 100}% ${
        config.emojis.arrow_right
      } ${newSoundboardSound.volume * 100}%`
    );

  if (
    updated.length === 0 &&
    oldSoundboardSound.name === newSoundboardSound.name
  )
    return;
  if (updated.length > 0)
    embed.addFields({
      name: "✏️ - Informations modifiées",
      value: `>>> ${updated.map((v) => `- ${v}`).join("\n")}`,
    });

  const channel = (await client.channels.fetch(
    "1452766765552762993"
  )) as TextChannel;
  channel.send({
    embeds: [embed],
  });
};
