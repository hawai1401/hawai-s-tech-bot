import {
  EmbedBuilder,
  CategoryChannel,
  MediaChannel,
  ThreadChannel,
  GuildChannel,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import ms from "ms";
import config from "../../../config.json" with { type: "json" };
import erreurMsg from "../../functions/errorMsg.js";

export const data = {
  name: "info-salon",
  alias: ["isa", "ic", "ci"],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const channel =
    message.mentions.channels.first() ??
    (args[0] ? await message.guild!.channels.fetch(args[0]!) : message.channel);
  const channelTypes = {
    0: "Textuel",
    1: "Message Privé",
    2: "Vocal",
    3: "Groupe Message Privé",
    4: "Catégorie",
    5: "Annonce",
    10: "Fils de nouveauté",
    11: "Fils Publique",
    12: "Fils Privé",
    13: "Conférence",
    14: "GuildDirectory",
    15: "Forum",
    16: "Média",
  };
  if (
    !channel ||
    channel instanceof MediaChannel ||
    channel instanceof ThreadChannel
  )
    return erreurMsg("Salon invalide !", message);
  if (
    !(channel instanceof CategoryChannel) &&
    channel instanceof GuildChannel
  ) {
    return await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embed.normal)
          .addFields({
            name: "ℹ️ - Informations",
            value: `>>> **ID** : ${channel.id}\n**Catégorie** : ${
              channel.parent
                ? `${channel.parent.name} \`${channel.parent.name}\``
                : config.emojis.error
            }\n**Nom** : <#${channel.id}> \`${
              channel.name
            }\`\n**Description** : ${
              !channel.isVoiceBased() && channel.topic
                ? channel.topic
                : config.emojis.error
            }\n**Créé** <t:${Math.floor(
              channel.createdTimestamp / 1000
            )}:R> (<t:${Math.floor(
              channel.createdTimestamp / 1000
            )}:F>)\n**Type de salon** : ${channelTypes[channel.type]}`,
          })
          .addFields({
            name: "📚 - Informations avancées",
            value: `>>> **Mode lent** : ${
              channel.rateLimitPerUser
                ? ms(channel.rateLimitPerUser * 1000, { long: true })
                : config.emojis.error
            }\n**NSFW** : ${
              channel.nsfw ? config.emojis.success : config.emojis.error
            }`,
          }),
      ],
    });
  } else if (channel instanceof CategoryChannel) {
    return await message.reply({
      embeds: [
        new EmbedBuilder().setColor(config.embed.normal).addFields({
          name: "ℹ️ - Informations",
          value: `>>> **ID** : ${channel.id}\n**Nom** : <#${channel.id}> \`${
            channel.name
          }\`\n**Créé** <t:${Math.floor(
            channel.createdTimestamp / 1000
          )}:R> (<t:${Math.floor(
            channel.createdTimestamp / 1000
          )}:F>)\n**Type de salon** : ${channelTypes[channel.type]}`,
        }),
      ],
    });
  }
};
