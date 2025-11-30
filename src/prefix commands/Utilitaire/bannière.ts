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
  name: "bannière",
  description: "Afficher votre bannière ou celle d'un autre utilisateur.",
  alias: ["banner"],
  options: [
    {
      name: "utilisateur",
      description: "L'utilisateur dont vous souhaitez obtenir la bannière.",
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
  const banner = user.bannerURL({ size: 4096 });
  if (!banner)
    return erreurMsg("Cet utilisateur ne possède pas de bannière !", message);

  message.reply({
    content: banner,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new Button("lien", { text: "Bannière" }, banner)
      ),
    ],
  });
};
