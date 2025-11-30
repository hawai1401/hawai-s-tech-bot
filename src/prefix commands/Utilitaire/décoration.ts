import {
  ActionRowBuilder,
  ButtonBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import Button from "../../class/button.js";
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "décoration",
  description: "Afficher votre décoration ou celle d'un autre utilisateur.",
  alias: ["déco"],
  options: [
    {
      name: "utilisateur",
      description:
        "L'utilisateur dont vous souhaitez obtenir la décoration d'avatar.",
      type: "user",
      required: false,
    },
  ],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const user = await client.users
    .fetch(message.mentions.users.first() ?? args[0] ?? message.author.id, {
      force: true,
    })
    .catch(
      async () => await client.users.fetch(message.author.id, { force: true })
    );
  const decoration = user.avatarDecorationURL({ size: 4096 });
  if (!decoration)
    return erreurMsg(
      "Cet utilisateur ne possède pas de décoration d'avatar !",
      message
    );

  message.reply({
    content: decoration,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new Button("lien", { text: "Décoration" }, decoration)
      ),
    ],
  });
};
