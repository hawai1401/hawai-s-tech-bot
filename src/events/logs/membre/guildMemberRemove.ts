import { EmbedBuilder, type GuildMember, type TextChannel } from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildMemberRemove";

export const event = async (client: botClient, member: GuildMember) => {
  const user = await client.users.fetch(member.id);
  const roles: Array<string> = [];

  for (const [_, role] of member.roles.cache) {
    if (role.name !== "@everyone")
      roles.push(`> - <@&${role.id}> \`${role.name}\``);
    if (roles.length === 5) {
      roles.length > 5
        ? roles.push(`> - Et ${roles.length - 5} autres...`)
        : "";
      break;
    }
  }

  const embed = new EmbedBuilder()
    .setDescription(" ")
    .setThumbnail(user.avatarURL({ size: 4096 }))
    .addFields({
      name: ":information_source: - Informations sur l'utilisateur",
      value: `>>> **ID** : ${user.id}\n**Pseudo d'affichage** : ${
        user.displayName
      }\n**Pseudo** : ${
        user.username
      }\n**Création du compte** : <t:${Math.floor(
        user.createdTimestamp / 1000
      )}:F> (*<t:${Math.floor(user.createdTimestamp / 1000)}:R>*)`,
    })
    .setImage(user.bannerURL({ size: 4096 }) ?? null)
    .setColor(config.embed.error)
    .setFooter({ text: "Ancien membre", iconURL: member.guild.iconURL() ?? "" })
    .setTimestamp();

  if (roles[0])
    embed.addFields({
      name: "👤 - Rôles",
      value: roles.join("\n"),
    });

  const channel = (await client.channels.fetch(
    "1418175835860635669"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
