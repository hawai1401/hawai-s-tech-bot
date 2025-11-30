import {
  EmbedBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "unban",
  description: "Débannir un utilisateur.",
  alias: ["deban"],
  permission: "BanMembers",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const user =
    message.mentions.users.first() ??
    (args[0] ? await client.users.fetch(args[0]) : null);
  if (!user) return erreurMsg("Utilisateur invalide !", message);
  const raison = args.slice(1).join(" ") || "Aucune raison fournie";

  // Utilisateur veut se ban lui-même
  if (message.author.id === user.id)
    return erreurMsg("Vous n'êtes pas banni :stuck_out_tongue:", message);

  // Utilisateur veut ban le bot
  if (user.id === client.user.id)
    return erreurMsg("Je suis déjà là :stuck_out_tongue:", message);

  // Bot peut ban la personne ?
  if (!message.guild!.members.me!.permissions.has("BanMembers"))
    return erreurMsg(
      "Je n'ai pas la permission de dédébannir un membre !",
      message
    );

  // Utilisateur déjà ban ?
  try {
    await message.guild!.bans.fetch(user.id);
  } catch {
    return erreurMsg(`${user} (${user.id}) n'est pas banni !`, message);
  }

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Débanni`)
          .setDescription(`> Vous venez d'être débanni !`)
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

  await message.guild!.bans.remove(
    user.id,
    `@${message.author.tag} (${message.author.id}) : ${raison}`
  );

  const embed = new EmbedBuilder()
    .setDescription(
      `### ${config.emojis.success} - ${user} a bien été débanni !`
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
};
