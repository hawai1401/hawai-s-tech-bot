import {
  EmbedBuilder,
  GuildMember,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "expulser",
  alias: ["kick"],
  permission: "KickMembers",
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
  const raison = args.slice(1).join(" ") || "Aucune raison fournie";

  // Utilisateur veut se mute lui-même
  if (message.author.id === user.id)
    return erreurMsg(
      "Vous ne pouvez pas vous expulser :stuck_out_tongue:",
      message
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreurMsg(
      "Il en faudra plus pour me faire disparaître :stuck_out_tongue:",
      message
    );

  // Utilisateur est au-dessus de la personne à mute ?
  const member_highthest_role = interaction_user.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
    (member_highthest_role <= user_highthest_role &&
      interaction_user.id !== message.guild!.ownerId) ||
    user.id === message.guild!.ownerId
  )
    return erreurMsg(
      "Vous ne pouvez pas expulser un utilisateur qui supérieur ou égal à vous !",
      message
    );

  // Bot peut mute la personne ?
  if (!message.guild!.members.me!.permissions.has("KickMembers"))
    return erreurMsg(
      "Je n'ai pas la permission d'expulser un membre !",
      message
    );

  if (message.guild!.members.me!.roles.highest.position <= user_highthest_role)
    return erreurMsg(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez expulser !",
      message
    );

  const raison_kick = `@${message.author.tag} (${message.author.id}) : ${raison}`;

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Expulsé`)
          .setDescription(`> Vous venez d'être expulsé !`)
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

  await user.kick(raison_kick);

  const embed = new EmbedBuilder()
    .setDescription(
      `### ${config.emojis.success} - ${user} a bien été expulsé !`
    )
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/Qu0EBPEe748AAAAd/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
};
