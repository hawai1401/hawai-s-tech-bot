import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ChannelType,
  NewsChannel,
  ForumChannel,
  StageChannel,
  TextChannel,
  VoiceChannel,
  EmbedBuilder,
  CategoryChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import ms from "ms";
import config from "../../../config.json" with { type: "json" };

export const name = "info-salon";
export const description = "Donne des informations sur un salon.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .addChannelOption((o) =>
    o
      .setName("salon")
      .setDescription("Le salon dont vous souhaitez avoir les informations.")
      .addChannelTypes(
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildStageVoice,
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.GuildCategory
      )
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const channel =
    (interaction.options.getChannel("salon") as
      | NewsChannel
      | ForumChannel
      | StageChannel
      | TextChannel
      | VoiceChannel
      | CategoryChannel
      | null) || interaction.channel;
  const channelTypes = {
    0: "Textuel",
    1: "Message Privé",
    2: "Vocal",
    3: "Groupe Message Privé",
    4: "Catégorie",
    5: "Annonce",
    10: "Fils de nouveauté",
    11: "Fils Publique",
    12: "Fils Privé",
    13: "Conférence",
    14: "GuildDirectory",
    15: "Forum",
    16: "Média",
  };
  if (!channel || channel.isThread() || channel.isDMBased())
    return erreur("Salon invalide !", interaction);

  if (!(channel instanceof CategoryChannel))
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embed.normal)
          .addFields({
            name: "ℹ️ - Informations",
            value: `>>> **ID** : ${channel.id}\n**Catégorie** : ${
              channel.parent
                ? `${channel.parent.name} \`${channel.name}\``
                : config.emojis.error
            }\n**Nom** : <#${channel.id}> \`${
              channel.name
            }\`\n**Description** : ${
              !channel.isVoiceBased() && channel.topic
                ? channel.topic
                : config.emojis.error
            }\n**Créé** <t:${Math.floor(
              channel.createdTimestamp / 1000
            )}:R> (<t:${Math.floor(
              channel.createdTimestamp / 1000
            )}:F>)\n**Type de salon** : ${channelTypes[channel.type]}`,
          })
          .addFields({
            name: "📚 - Informations avancées",
            value: `>>> **Model lent** : ${
              channel.rateLimitPerUser
                ? ms(channel.rateLimitPerUser * 1000, { long: true })
                : config.emojis.error
            }\n**NSFW** : ${
              channel.nsfw ? config.emojis.success : config.emojis.error
            }`,
          }),
      ],
    });
  await interaction.reply({
    embeds: [
      new EmbedBuilder().setColor(config.embed.normal).addFields({
        name: "ℹ️ - Informations",
        value: `>>> **ID** : ${channel.id}\n**Nom** : <#${channel.id}> \`${
          channel.name
        }\`\n**Créé** <t:${Math.floor(
          channel.createdTimestamp / 1000
        )}:R> (<t:${Math.floor(
          channel.createdTimestamp / 1000
        )}:F>)\n**Type de salon** : ${channelTypes[channel.type]}`,
      }),
    ],
  });
};
