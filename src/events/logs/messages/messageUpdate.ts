import {
  EmbedBuilder,
  type Message,
  type OmitPartialGroupDMChannel,
  type PartialMessage,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "messageUpdate";
export const event = async (
  client: botClient,
  oldMessage: OmitPartialGroupDMChannel<Message | PartialMessage>,
  newMessage: OmitPartialGroupDMChannel<Message>
) => {
  if (
    oldMessage.content === newMessage.content ||
    !oldMessage.content ||
    !newMessage.inGuild()
  )
    return;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: newMessage.author.username,
      iconURL: newMessage.author.displayAvatarURL(),
    })
    .setColor(config.embed.warn)
    .addFields({
      name: "📤 - Ancien message",
      value: oldMessage.content,
    })
    .addFields({
      name: "📥 - Nouveau message",
      value: newMessage.content,
    })
    .addFields({
      name: "📌 - Salon",
      value: `>>> ${newMessage.channel} \`${newMessage.channel.name}\``,
    })
    .setFooter({
      text: "Message modifié",
      iconURL: newMessage.guild!.iconURL() ?? "",
    })
    .setTimestamp();

  const channel = (await client.channels.fetch(
    "1413831997293461585"
  )) as TextChannel;
  channel.send({
    embeds: [embed],
  });
};
