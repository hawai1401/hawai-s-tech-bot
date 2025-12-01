import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type Sticker,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "stickerUpdate";

export const event = async (
  client: botClient,
  oldSticker: Sticker,
  newSticker: Sticker
) => {
  const log = (
    await newSticker.guild!.fetchAuditLogs({
      type: AuditLogEvent.StickerUpdate,
      limit: 1,
    })
  ).entries.first();
  const createur = log?.executorId
    ? await client.users.fetch(log.executorId)
    : null;

  const embed = new EmbedBuilder()
    .setThumbnail(newSticker.url)
    .addFields({
      name: "🔧  - Informations sur l'autocollant",
      value: `>>> **ID** : ${newSticker.id}\n**Nom** : ${
        oldSticker.name !== newSticker.name
          ? `${oldSticker.name} ${config.emojis.arrow_right} ${newSticker.name}`
          : newSticker.name
      }\n**Description** : ${
        oldSticker.description !== newSticker.description
          ? `_${oldSticker.description ?? "Aucune"}_ ${
              config.emojis.arrow_right
            } _${newSticker.description ?? "Aucune"}_`
          : `_${newSticker.description}_`
      }\n**Émoji similaire** : ${
        oldSticker.tags !== newSticker.tags
          ? `${oldSticker.tags} ${config.emojis.arrow_right} ${newSticker.tags}`
          : newSticker.tags
      }`,
    })
    .setColor(config.embed.warn)
    .setFooter({
      text: "Autocollant modifié",
      iconURL: newSticker.guild!.iconURL() ?? "",
    })
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
      value: `> ${config.emojis.error} - Impossible de trouver l'administrateur qui a modifié cet autocollant.`,
    });
  }

  const channel = (await client.channels.fetch(
    "1445032201224720404"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
