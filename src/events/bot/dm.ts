import {
  EmbedBuilder,
  type Message,
  type OmitPartialGroupDMChannel,
  type PartialMessage,
} from "discord.js";
import config from "../../../config.json" with { type: "json" };
import type { botClient } from "../../index.js";

export const type = "messageCreate";

export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>
) => {
  if (
    !message.author ||
    message.author.id === client.user.id ||
    message.guildId
  )
    return;

  // const owner_dm = await bot.channels.fetch(1413521853401661450n);
  // const messages = await owner_dm.messages.fetch();
  // messages.forEach(async (element) => {
  //   const message = await owner_dm.messages.fetch(element.id);
  //   if (message.author.id === bot.user.id) message.delete();
  // });

  const owner = await client.users.fetch(config["owner-id"][0]!);
  const embed = new EmbedBuilder()
    .setDescription(`- Autheur : ${message.author} (${message.author.id})`)
    .setColor(config.embed.normal);
  client.users.send(owner, {
    content: message.content || "Message Vide",
    embeds: [embed],
  });
};
