import { EmbedBuilder, type GuildMember, type TextChannel } from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildMemberAdd";

export const event = async (client: botClient, member: GuildMember) => {
  const user = await client.users.fetch(member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(user.avatarURL({ size: 4096 }))
    .addFields({
      name: ":information_source: - Informations sur l'utilisateur",
      value: `>>> **ID** : ${user.id}\n**Pseudo d'affichage** : ${
        user.displayName
      }\n**Pseudo** : ${
        user.username
      }\n**Création du compte** : <t:${Math.floor(
        user.createdTimestamp / 1000
      )}:F> (*<t:${Math.floor(
        user.createdTimestamp / 1000
      )}:R>*)\n**Le membre était déjà venu sur le serveur** : ${
        member.flags.toArray().includes("DidRejoin")
          ? "<:coche:1408551329026146334>"
          : "<:croix:1408551342821212230>"
      }`,
    })
    .setImage(user.bannerURL({ size: 4096 }) ?? null)
    .setColor(config.embed.success)
    .setFooter({
      text: "Nouveau membre",
      iconURL: member.guild.iconURL() ?? "",
    })
    .setTimestamp();

  if ((await member.guild.fetchOnboarding()).enabled)
    embed.addFields({
      name: ":clipboard: - État du processus d'accueil",
      value: `> ${config.emojis.warn} - En cours...`,
    });
  // @ts-expect-error
  if (member.guild.features.includes("GUILD_SERVER_GUIDE"))
    embed.addFields({
      name: ":clipboard: - État du guide du serveur",
      value: `> ${config.emojis.error} - Non commencé`,
    });

  const channel = (await client.channels.fetch(
    "1418175835860635669"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
