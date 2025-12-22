import {
  AuditLogEvent,
  EmbedBuilder,
  type GuildSoundboardSound,
  type PartialSoundboardSound,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildSoundboardSoundDelete";

export const event = async (
  client: botClient,
  soundboardSound: GuildSoundboardSound | PartialSoundboardSound
) => {
  const log = (
    await soundboardSound.guild!.fetchAuditLogs({
      type: AuditLogEvent.SoundboardSoundDelete,
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
    .addFields({
      name: "🔧  - Informations sur le son",
      value: `>>> **ID** : ${soundboardSound.soundId}\n**Nom** : ${
        soundboardSound.name
      }\n**Volume** : ${soundboardSound.volume}%\n**Émoji similaire** : ${
        soundboardSound.emoji ?? "Aucun"
      }\n**Créé** <t:${Math.floor(
        soundboardSound.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(soundboardSound.createdTimestamp / 1000)}:F>)`,
    })
    .setColor(config.embed.error)
    .setFooter({
      text: "Soundboard supprimé",
      iconURL: soundboardSound.guild!.iconURL() ?? "",
    })
    .setTimestamp();

  const channel = (await client.channels.fetch(
    "1452766765552762993"
  )) as TextChannel;
  channel.send({
    embeds: [embed],
  });
};
