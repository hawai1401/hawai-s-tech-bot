import { Message, type OmitPartialGroupDMChannel } from "discord.js";
import config from "../../config.json" with { type: "json" };
import Container from "../class/container.js";

export default async function erreurMsg(
  erreur: string,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  options?: { notReply?: boolean }
) {
  if (options?.notReply)
    return message.channel.send({
      content: `${message.author}`,
      components: [
        new Container("error").addText(
          `### ${config.emojis.error} - ${erreur}`
        ),
      ],
      flags: 32768,
    });
  return message.reply({
    components: [
      new Container("error").addText(`### ${config.emojis.error} - ${erreur}`),
    ],
    flags: 32768,
  });
}
