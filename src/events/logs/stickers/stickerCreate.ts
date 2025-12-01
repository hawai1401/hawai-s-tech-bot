import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type Sticker,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "stickerCreate";

export const event = async (client: botClient, sticker: Sticker) => {
  const log = (
    await sticker.guild!.fetchAuditLogs({
      type: AuditLogEvent.StickerCreate,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setThumbnail(sticker.url)
    .addFields({
      name: "🔧  - Informations sur l'autocollant",
      value: `>>> **ID** : ${sticker.id}\n**Nom** : ${
        sticker.name
      }\n**Description** : _${
        sticker.description ?? "Aucune"
      }_\n**Émoji similaire** : ${sticker.tags}\n**Créé** <t:${Math.floor(
        sticker.createdTimestamp / 1000
      )}:R> (<t:${Math.floor(sticker.createdTimestamp / 1000)}:F>)`,
    })
    .setColor(config.embed.success)
    .setFooter({ text: "Autocollant créé", iconURL: sticker.guild!.iconURL() ?? "" })
    .setTimestamp();

  if (createur) {
    embed
      .setAuthor({
        name: createur.username,
        iconURL: createur.displayAvatarURL(),
      })
      .addFields({
        name: "🛡️ - Administrateur",
        value: `>>> **ID** : ${createur.id}\n**Pseudo** : ${createur} \`${createur.username}\``,
      });
  } else {
    embed.addFields({
      name: "🛡️ - Administrateur",
      value: `> ${config.emojis.error} - Impossible de trouver l'administrateur qui a créé cet autocollant.`,
    });
  }

  const channel = (await client.channels.fetch(
    "1445032201224720404"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
