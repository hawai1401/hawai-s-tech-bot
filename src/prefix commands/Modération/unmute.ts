import {
  EmbedBuilder,
  GuildMember,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";
import warnMsg from "../../functions/warnMsg.js";

export const data: prefixCommand_data = {
  name: "unmute",
  alias: [],
  permission: "ModerateMembers",
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
  if (!user) return erreurMsg("Utilisateur invalide !", message);
  const raison = args.slice(1).join(" ") || "Aucune raison fournie";

  // Utilisateur dans le serveur ?
  try {
    await message.guild!.members.fetch(user.id);
  } catch {
    return erreurMsg(
      "Vous ne pouvez pas rendre la voix à un utilisateur qui ne se trouve pas sur le serveur !",
      message
    );
  }

  // Utilisateur veut se mute lui-même
  if (message.author.id === user.id)
    return erreurMsg(
      "Vous n'êtes pas muet, vous venez de faire la commande :wink:",
      message
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreurMsg("Je ne me tais jamais :stuck_out_tongue:", message);

  // Utilisateur est au-dessus de la personne à mute ?
  const member_highthest_role = interaction_user.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
    member_highthest_role <= user_highthest_role ||
    interaction_user.id !== message.guild!.ownerId
  )
    return erreurMsg(
      "Vous ne pouvez pas rendre la voix à un utilisateur qui supérieur ou égal à vous !",
      message
    );

  // Bot peut mute la personne ?
  if (!message.guild!.members.me!.permissions.has("ModerateMembers"))
    return erreurMsg(
      "Je n'ai pas la permission de rendre la voix à un membre !",
      message
    );

  if (message.guild!.members.me!.roles.highest.position <= user_highthest_role)
    return erreurMsg(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre auquel vous souhaitez rendre la voix muet !",
      message
    );

  // Utilisateur déjà mute ?
  if (
    !user.communicationDisabledUntilTimestamp ||
    user.communicationDisabledUntilTimestamp < Date.now()
  )
    return warnMsg("Cet utilisateur n'est pas muet !", message);

  const raison_demute = `@${message.author.tag} (${message.author.id}) : ${raison}`;
  await user.disableCommunicationUntil(null, raison_demute);

  const embed = new EmbedBuilder()
    .setDescription(
      `### <:coche:1408551329026146334> - ${user} a retrouvé la voix !`
    )
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/FjUd6NvVRnMAAAAC/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  await message.reply({ embeds: [embed] });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.success} - Plus muet`)
    .setDescription(`> Vous pouvez de nouveau discuter !`)
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
