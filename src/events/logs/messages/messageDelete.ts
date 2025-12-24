import {
  EmbedBuilder,
  type Message,
  type OmitPartialGroupDMChannel,
  type PartialMessage,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "messageDelete";
export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message | PartialMessage>
) => {
  if (!message.author || !message.content) return;
  client.snipes.set(message.channelId, message);

  const embed = new EmbedBuilder()
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.displayAvatarURL(),
    })
    .setColor(config.embed.error)
    .addFields({
      name: "💬 - Contenu",
      value: message.content,
    })
    .addFields({
      name: "📌 - Salon",
      value: `>>> ${message.channel} \`${message.channelId}\``,
    })
    .setFooter({
      text: "Message supprimé",
      iconURL: message.guild!.iconURL() ?? "",
    })
    .setTimestamp();

  const channel = (await client.channels.fetch(
    "1413831997293461585"
  )) as TextChannel;
  channel.send({
    embeds: [embed],
  });
};
