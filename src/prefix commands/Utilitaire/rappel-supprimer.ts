import { Message, type OmitPartialGroupDMChannel } from "discord.js";
import { getDb } from "../../db/mongo.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import erreurMsg from "../../functions/errorMsg.js";
import successMsg from "../../functions/successMsg.js";

export const data: prefixCommand_data = {
  name: "rappel-supprimer",
  description: "Supprimer un rappel.",
  alias: ["unremind", "remind-remove", "remindremove"],
  options: [
    {
      name: "rappel",
      description: "Le rappel à supprimer.",
      type: "string",
      required: true,
    },
  ],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const db = getDb().Rappels;

  const rappel_id = args[0];
  if (!rappel_id)
    return erreurMsg("Vous ne pouvez pas ajouter un rappel vide !", message);

  const rappel = await db.findOneAndDelete({ _id: rappel_id });
  if (!rappel)
    return erreurMsg(
      "Rappel invalide ! Merci de choisir un rappel dans la liste !",
      message
    );
  return successMsg("Rappel supprimer avec succès !", message);
};
