import { Message, type OmitPartialGroupDMChannel } from "discord.js";
import type { botClient } from "../../index.js";
import erreurMsg from "../../functions/errorMsg.js";
import successMsg from "../../functions/successMsg.js";

export const data = {
  name: "clear",
  alias: ["cls"]
}

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  if (!message.guild!.members.me!.permissions.has("ManageMessages"))
    return erreurMsg(
      "Je n'ai pas la permission de gérer les messages !",
      message
    );
  if (
    !(await message.guild!.members.fetch(message.author.id)).permissions.has(
      "ManageMessages"
    )
  )
    return erreurMsg(
      "Vous n'avez pas la permission de gérer les messages !",
      message
    );
  if (message.channel!.isDMBased())
    return erreurMsg("Commande indisponible dans ce salon !", message);
  const nbr_msg = Number(args[0]);
  if (isNaN(nbr_msg) || nbr_msg === 0 || nbr_msg > 99)
    return erreurMsg(
      "Nombre de message invalide ! Il doit être compris entre 1 et 99.",
      message
    );
  const msg = await message.channel!.bulkDelete(nbr_msg + 1, true);
  if (msg.size === 0)
    return erreurMsg(
      "Aucun message n'a été supprimé !\nPeut-être qu'ils datent de plus de 14 jours.",
      message
    );

  return successMsg(
    `${msg.size} messages ont été supprimé avec succès !`,
    message,
    { notReply: true }
  );
};
