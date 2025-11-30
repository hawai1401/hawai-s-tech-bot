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
  name: "avatar",
  description: "Afficher votre avatar ou celui d'un autre utilisateur.",
  alias: ["pp"],
  options: [
    {
      name: "utilisateur",
      description: "L'utilisateur dont vous souhaitez obtenir l'avatar.",
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
  const avatar = user.displayAvatarURL({ size: 4096 });
  if (!avatar)
    return erreurMsg("Cet utilisateur ne possède pas d'avatar !", message);

  message.reply({
    content: avatar,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new Button("lien", { text: "Avatar" }, avatar)
      ),
    ],
  });
};
