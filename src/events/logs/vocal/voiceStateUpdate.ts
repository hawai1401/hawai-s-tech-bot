import {
  AuditLogEvent,
  ChannelType,
  EmbedBuilder,
  type TextChannel,
  type VoiceState,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "voiceStateUpdate";

export const event = async (
  client: botClient,
  oldState: VoiceState,
  newState: VoiceState
) => {
  if (
    !newState.member ||
    oldState.channel?.type === ChannelType.GuildStageVoice ||
    newState.channel?.type === ChannelType.GuildStageVoice
  )
    return;
  const user = await client.users.fetch(newState.member.id);
  const channel = (await client.channels.fetch(
    "1443680371379015720"
  )) as TextChannel;
  const embed = new EmbedBuilder()
    .setThumbnail(newState.member.displayAvatarURL())
    .addFields({
      name: "👤 - Utilisateur",
      value: `>>> **ID** : ${user.id}\n**Pseudo** : ${user} \`${user.username}\``,
    })
    .setTimestamp();

  if (oldState.channelId !== newState.channelId) {
    if (!oldState.channelId) {
      embed
        .setColor(config.embed.success)
        .addFields({
          name: "🔉 - Salon",
          value: `>>> **ID** : ${newState.channelId}\n**Nom** : ${
            newState.channel
          } \`${
            newState.channel!.name
          }\`\n**Nombre de membre dans le salon** : ${
            newState.channel!.members.size
          }`,
        })
        .setFooter({
          text: "Connection à un salon vocal",
          iconURL: newState.guild.iconURL()!,
        });
    } else if (!newState.channelId) {
      embed
        .setColor(config.embed.error)
        .addFields({
          name: "🔉 - Salon",
          value: `>>> **ID** : ${oldState.channelId}\n**Nom** : ${
            oldState.channel
          } \`${
            oldState.channel!.name
          }\`\n**Nombre de membre dans le salon** : ${
            oldState.channel!.members.size
          }`,
        })
        .setFooter({
          text: "Déconnection d'un salon vocal",
          iconURL: newState.guild.iconURL()!,
        });
    } else {
      embed
        .setColor(config.embed.warn)
        .addFields({
          name: "📤 - Ancien salon",
          value: `>>> **ID** : ${oldState.channelId}\n**Nom** : ${
            oldState.channel
          } \`${
            oldState.channel!.name
          }\`\n**Nombre de membre dans le salon** : ${
            oldState.channel!.members.size
          }`,
        })
        .addFields({
          name: "📥 - Nouveau salon",
          value: `>>> **ID** : ${newState.channelId}\n**Nom** : ${
            newState.channel
          } \`${
            newState.channel!.name
          }\`\n**Nombre de membre dans le salon** : ${
            newState.channel!.members.size
          }`,
        })
        .setFooter({
          text: "Changement de salon vocal",
          iconURL: newState.guild.iconURL()!,
        });
    }
    return await channel.send({ embeds: [embed] });
  }

  const log = (
    await newState.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberUpdate,
      user,
      limit: 1,
    })
  ).entries.first();
  const mod = log?.executor;
  if (mod) {
    embed.addFields({
      name: "🛡️ - Modérateur",
      value: `>>> **ID** : ${mod.id}\n**Pseudo** : ${mod} \`${mod.username}\``,
    });
  } else {
    embed.addFields({
      name: "🛡️ - Modérateur",
      value: `> ${config.emojis.error} - Impossible de trouver le modérateur à l'origine de cette action.`,
    });
  }

  if (oldState.serverDeaf !== newState.serverDeaf) {
    if (oldState.serverDeaf) {
      embed.setColor(config.embed.success).setFooter({
        text: "Membre plus sourd",
        iconURL: newState.guild.iconURL()!,
      });
    } else {
      embed.setColor(config.embed.error).setFooter({
        text: "Membre rendu sourd",
        iconURL: newState.guild.iconURL()!,
      });
    }
    return await channel.send({ embeds: [embed] });
  }
  if (oldState.serverMute !== newState.serverMute) {
    if (oldState.serverMute) {
      embed.setColor(config.embed.success).setFooter({
        text: "Membre plus muet",
        iconURL: newState.guild.iconURL()!,
      });
    } else {
      embed.setColor(config.embed.error).setFooter({
        text: "Membre rendu muet",
        iconURL: newState.guild.iconURL()!,
      });
    }
    return await channel.send({ embeds: [embed] });
  }
};
