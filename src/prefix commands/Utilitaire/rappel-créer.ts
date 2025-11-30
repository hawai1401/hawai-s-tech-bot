import {
  EmbedBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import ms, { type StringValue } from "ms";
import { getDb } from "../../db/mongo.js";
import config from "../../../config.json" with { type: "json" };
import type { botClient, prefixCommand_data } from "../../index.js";
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "rappel-créer",
  description: "Créer un nouveau rappel.",
  alias: ["remind", "remind-add", "remindadd"],
  options: [
    {
      name: "message",
      description: "Le message du rappel qui vous sera envoyé.",
      type: "string",
      required: true,
    },
    {
      name: "temps",
      description: "Dans combien de temps le rappel doit être envoyé ?",
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

  const content = args[0];
  const temps = args[1] as StringValue | undefined;
  if (!content)
    return erreurMsg("Vous ne pouvez pas ajouter un rappel vide !", message);
  if (!temps) return erreurMsg("Durée invalide", message);

  try {
    const temps_ms = ms(temps);
    if (!temps_ms) throw new Error("Durée invalide");
  } catch {
    return erreurMsg(
      `La durée entrée est invalide !\n\n>>> \`1 semaine\` ${config.emojis.arrow_right} \`1w\`\n\`1 jour\` ${config.emojis.arrow_right} \`1d\`\n\`1 heure\` ${config.emojis.arrow_right} \`1h\`\n\`1 minute\` ${config.emojis.arrow_right} \`1m\``,
      message
    );
  }

  console.log(ms(temps), Math.floor((Date.now() + ms(temps)) / 1000));
  const temps_s = Math.floor((Date.now() + ms(temps)) / 1000);

  const nbr_rappels = await db.find({
    user: message.author.id,
  });

  if (nbr_rappels.length === 25)
    return erreurMsg(
      "Vous avez atteint la limite de 25 rappels ! Merci d'en supprimer un avant d'en rajouter un autre.",
      message
    );
  await db.insertOne({
    user: message.author.id,
    message: content,
    date: temps_s,
  });

  return await message.reply({
    embeds: [
      new EmbedBuilder()
        .setFields(
          { name: ":bookmark_tabs: - Contenu", value: `> ${content}` },
          {
            name: ":calendar_spiral: - Date",
            value: `> Le <t:${temps_s}:d> à <t:${temps_s}:t> (<t:${temps_s}:R>).`,
          }
        )
        .setFooter({
          text: `N'oubliez pas d'ouvrir vos MP !`,
          iconURL: client.user.displayAvatarURL() as string,
        })
        .setColor(config.embed.success)
        .setTimestamp(),
    ],
  });
};
