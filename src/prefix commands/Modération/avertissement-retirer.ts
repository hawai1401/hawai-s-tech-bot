import {
  EmbedBuilder,
  GuildMember,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import { getDb } from "../../db/mongo.js";
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "avertissement-retirer",
  alias: ["unwarn", "warn-remove", "warnremove"],
  permission: "ManageMessages",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const interaction_user = await message.guild!.members.fetch(
    message.author.id
  );
  const user: GuildMember | null = await new Promise(async (res) => {
    try {
      res(
        await message.guild!.members.fetch(
          message.mentions.users.first() ?? args[0]!
        )
      );
    } catch {
      res(null);
    }
  });
  if (!user)
    return erreurMsg(
      "L'utilisateur est invalide ou n'est pas présent sur le serveur !",
      message
    );
  const db = getDb().Warns;

  if (message.author.id === user.id)
    return erreurMsg(
      `Vous ne pouvez pas vous retirer un avertissement :stuck_out_tongue:`,
      message
    );

  if (user.id === client.user.id)
    return erreurMsg("Je suis trop parfait pour ça :sunglasses:", message);

  const member_highthest_role = interaction_user.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
    (member_highthest_role <= user_highthest_role &&
      interaction_user.id !== message.guild!.ownerId) ||
    user.id === message.guild!.ownerId
  )
    return erreurMsg(
      `Vous ne pouvez pas retirer un avertissement à un utilisateur qui supérieur ou égal à vous !`,
      message
    );

  const getEmbed = (text: string, raison: string) =>
    new EmbedBuilder()
      .setDescription(`### ${config.emojis.success} - ${text}`)
      .setFields({
        name: ":pencil: - Raison",
        value: `\`\`\`${raison}\`\`\``,
      })
      .setColor(config.embed.success)
      .setFooter({
        text: `Demandé par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

  let raison: string;
  if (!args[1])
    return erreurMsg(
      "Veuillez spécifier l'identifiant de l'avertissement à retirer",
      message
    );
  const db_warn = await db.findByIdAndDelete({
    _id: args[1],
  });
  if (!db_warn)
    return erreurMsg(
      "Avertissement invalide, merci de saisir un identifiant valide !",
      message
    );
  raison = db_warn.raison;
  await message.reply({
    embeds: [getEmbed(`L'avertissement a été supprimé avec succès !`, raison)],
  });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.warn} - Avertissement`)
    .setDescription(`> Un avertissement vient de vous être retiré !`)
    .setFields(
      {
        name: ":satellite: - Serveur",
        value: `\`\`\`${message.guild!.name}\`\`\``,
      },
      { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
    )
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await client.users.send(user.id, { embeds: [embed_DM] });
  } catch {}
};
