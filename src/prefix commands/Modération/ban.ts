import {
  EmbedBuilder,
  GuildMember,
  Message,
  User,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "ban",
  description: "Bannir un utilisateur.",
  alias: ["bannir"],
  permission: "BanMembers",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  let user: User | GuildMember | null =
    message.mentions.users.first() ??
    (args[0] ? await client.users.fetch(args[0]) : null);
  if (!user) return erreurMsg("Utilisateur invalide !", message);
  try {
    user = await message.guild!.members.fetch(user.id);
  } catch {}
  const raison = args.slice(1).join(" ") || "Aucune raison fournie";

  // Utilisateur veut se ban lui-même
  if (message.author.id === user.id)
    return erreurMsg(
      "Vous ne pouvez pas vous bannir vous même :stuck_out_tongue:",
      message
    );

  // Utilisateur veut ban le bot
  if (user.id === client.user.id)
    return erreurMsg(
      "Il en faudra plus pour me faire disparaître :stuck_out_tongue:",
      message
    );

  // Utilisateur est au-dessus de la personne à ban ?
  if (user instanceof GuildMember) {
    const member_highthest_role = message.member!.roles.highest.position;
    const user_highthest_role = user.roles.highest.position;
    if (
      (member_highthest_role <= user_highthest_role &&
        message.member!.id !== message.guild!.ownerId) ||
      user.id === message.guild!.ownerId
    )
      return erreurMsg(
        "Vous ne pouvez pas bannir un utilisateur qui supérieur ou égal à vous !",
        message
      );

    if (
      message.guild!.members.me!.roles.highest.position <= user_highthest_role
    )
      return erreurMsg(
        "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez bannir !",
        message
      );
  }

  // Bot peut ban la personne ?
  if (!message.guild!.members.me!.permissions.has("BanMembers"))
    return erreurMsg(
      "Je n'ai pas la permission de bannir un membre !",
      message
    );

  // Utilisateur déjà ban ?
  try {
    const ban = await message.guild!.bans.fetch(user.id);
    return await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("<:attention:1408491864906141807> - Déjà banni")
          .setDescription(`${user} (${user.id}) est déjà banni !`)
          .setFields({
            name: ":pencil: - Raison",
            value: `\`\`\`${ban.reason || "Aucun raison fournie"}\`\`\``,
          })
          .setColor(config.embed.warn)
          .setFooter({
            text: `Demandé par ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });
  } catch {}

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Banni`)
          .setDescription(`> Vous venez d'être banni !`)
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
          .setTimestamp(),
      ],
    });
  } catch {}

  await message.guild!.bans.create(user.id, {
    reason: `@${message.author.tag} (${message.author.id}) : ${raison}`,
  });

  const embed = new EmbedBuilder()
    .setDescription(`### ${config.emojis.success} - ${user} a bien été banni !`)
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/zJe691uJBtYAAAAd/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
};
