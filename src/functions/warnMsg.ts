import { Message, type OmitPartialGroupDMChannel } from "discord.js";
import config from "../../config.json" with { type: "json" };
import Container from "../class/container.js";

export default async function warnMsg(
  contenu: string,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  options?: { notReply?: boolean }
) {
  if (options?.notReply)
    return message.channel.send({
      content: `${message.author}`,
      components: [
        new Container("warn").addText(
          `### ${config.emojis.error} - ${contenu}`
        ),
      ],
      flags: 32768,
    });
  return message.reply({
    components: [
      new Container("warn").addText(`### ${config.emojis.error} - ${contenu}`),
    ],
    flags: 32768,
  });
}
