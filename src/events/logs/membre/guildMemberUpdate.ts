import {
  EmbedBuilder,
  type GuildMember,
  type PartialGuildMember,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildMemberUpdate";

export const event = async (
  client: botClient,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember
) => {
  const user = await client.users.fetch(newMember.id);
  const embed = new EmbedBuilder()
    .setThumbnail(user.avatarURL({ size: 4096 }))
    .addFields({
      name: ":information_source: - Informations sur l'utilisateur",
      value: `>>> **ID** : ${newMember.id}\n**Pseudo** : ${user} \`${user.username}\``,
    })
    .setImage(user.bannerURL({ size: 4096 }) ?? null)
    .setTimestamp();

  if (
    !oldMember.flags.has("CompletedOnboarding") &&
    newMember.flags.has("CompletedOnboarding")
  ) {
    const roles = [];
    for (const [_, role] of newMember.roles.cache) {
      if (role.name !== "@everyone")
        roles.push(`> - <@&${role.id}> \`${role.name}\``);
      if (roles.length === 5) {
        roles.length > 5
          ? roles.push(`\n> - Et ${roles.length - 5} autres...`)
          : "";
        break;
      }
    }
    embed
      .addFields({
        name: ":clipboard: - État du processus d'accueil",
        value: `> ${config.emojis.success} - Complété`,
      })
      .setColor(config.embed.success_2)
      .setFooter({
        text: "Membre confirmé",
        iconURL: newMember.guild.iconURL() ?? "",
      });

    // @ts-expect-error
    if (newMember.guild.features.includes("GUILD_SERVER_GUIDE"))
      embed.addFields({
        name: ":clipboard: - État du guide du serveur",
        value: `> ${config.emojis.error} - Non commencé`,
      });

    if (roles[0])
      embed.addFields({
        name: ":white_medium_small_square: - Rôles",
        value: roles.join("\n"),
      });
  } else if (
    !oldMember.flags.has("StartedHomeActions") &&
    newMember.flags.has("StartedHomeActions")
  ) {
    embed
      .addFields({
        name: ":clipboard: - État du processus d'accueil",
        value: `> ${config.emojis.success} - Complété`,
      })
      .addFields({
        name: ":clipboard: - État du guide du serveur",
        value: `> ${config.emojis.warn} - En cours...`,
      })
      .setColor(config.embed.success_2)
      .setFooter({
        text: "Membre confirmé",
        iconURL: newMember.guild.iconURL() ?? "",
      });
  } else if (
    !oldMember.flags.has("CompletedHomeActions") &&
    newMember.flags.has("CompletedHomeActions")
  ) {
    embed
      .addFields({
        name: ":clipboard: - État du processus d'accueil",
        value: `> ${config.emojis.success} - Complété`,
      })
      .addFields({
        name: ":clipboard: - État du guide du serveur",
        value: `> ${config.emojis.success} - Complété`,
      })
      .setColor(config.embed.success_2)
      .setFooter({
        text: "Membre confirmé",
        iconURL: newMember.guild.iconURL() ?? "",
      });
  } else if (oldMember.nickname !== newMember.nickname) {
    embed.setFields({
      name: ":information_source: - Informations sur l'utilisateur",
      value: `>>> **ID** : ${newMember.id}\n**Pseudo** : ${user} \`${
        user.username
      }\`\n**Pseudo sur le serveur** : ${oldMember.nickname ?? "Aucun"} ${
        config.emojis.arrow_right
      } ${newMember.nickname ?? "Aucun"}`,
    });
  } else if (oldMember.roles !== newMember.roles) {
    const oldRoles = [];
    for (const [key, role] of oldMember.roles.cache) {
      if (role.name !== "@everyone" && !newMember.roles.cache.has(key))
        oldRoles.push(`> - <@&${role.id}> \`${role.name}\``);
    }

    const newRoles = [];
    for (const [key, role] of newMember.roles.cache) {
      if (role.name !== "@everyone" && !oldMember.roles.cache.has(key))
        newRoles.push(`> - <@&${role.id}> \`${role.name}\``);
    }

    if (!oldRoles[0] && !newRoles[0]) return;

    embed
      .setColor(config.embed.warn)
      .setFooter({
        text: "Membre modifié",
        iconURL: newMember.guild.iconURL() ?? "",
      });

    if (oldRoles[0])
      embed.addFields({
        name: ":outbox_tray: - Anciens rôles",
        value: `${oldRoles.slice(0, 5).join("\n")}${
          oldRoles.length > 5 ? `\n> - Et ${oldRoles.length - 5} autres...` : ""
        }`,
      });

    if (newRoles[0])
      embed.addFields({
        name: ":inbox_tray: - Nouveaux rôles",
        value: `${newRoles.slice(0, 5).join("\n")}${
          newRoles.length > 5 ? `\n> - Et ${newRoles.length - 5} autres...` : ""
        }`,
      });
  } else {
    return;
  }

  const channel = (await client.channels.fetch(
    "1418175835860635669"
  )) as TextChannel;
  return await channel.send({ embeds: [embed] });
};
