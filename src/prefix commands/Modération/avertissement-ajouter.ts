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
  name: "avertissement-ajouter",
  description: "Avertir un membre.",
  alias: ["warn", "warn-add", "warnadd", "avertir"],
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
      `Vous ne pouvez pas vous ajouter un avertissement :stuck_out_tongue:`,
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
      `Vous ne pouvez pas ajouter un avertissement à un utilisateur qui supérieur ou égal à vous !`,
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

  const raison: string = args[1]!;

  const actual_warns = await db.find({
    user: user.id,
    guild: message.guildId,
  });
  if (actual_warns.length === 25)
    return erreurMsg(
      "Cet utilisateur a atteint la limite de 25 avertissements, merci d'en supprimer un avant d'en rajouter un nouveau !",
      message
    );
  await db.insertOne({
    guild: message.guildId!,
    author: interaction_user.id,
    user: user.id,
    raison,
  });

  await message.reply({
    embeds: [getEmbed(`${user} a été averti avec succès !`, raison)],
  });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.warn} - Avertissement`)
    .setDescription(`> Vous venez d'être averti !`)
    .setFields(
      {
        name: ":satellite: - Serveur",
        value: `\`\`\`${message.guild!.name}\`\`\``,
      },
      { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
    )
    .setColor(config.embed.warn)
    .setFooter({
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await client.users.send(user.id, { embeds: [embed_DM] });
  } catch {}
};
