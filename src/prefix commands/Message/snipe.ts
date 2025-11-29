import {
  EmbedBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "snipe",
  alias: [],
  permission: "ManageMessages",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  if (
    !(await message.guild!.members.fetch(message.author.id)).permissions.has(
      "ManageMessages"
    )
  )
    return erreurMsg(
      "Vous n'avez pas la permission de gérer les messages !",
      message
    );
  const msg = client.snipes.get(message.channelId);
  if (!msg)
    return erreurMsg("Aucun message n'a été supprimé dans ce salon.", message);
  const user = await client.users.fetch(msg.author!.id);
  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
        .setThumbnail(user.displayAvatarURL())
        .addFields({
          name: "👤 - Auteur",
          value: `>>> **Pseudo** : ${user.username}\n**ID** : ${user.id}`,
        })
        .addFields({
          name: "💬 - Contenu",
          value: `\`\`\`${msg.content}\`\`\``,
        })
        .setFooter({
          text: `Demandé par ${message.author.username}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp(),
    ],
  });
};
