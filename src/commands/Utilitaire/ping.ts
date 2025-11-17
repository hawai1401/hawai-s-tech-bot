import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  EmbedBuilder,
} from "discord.js";
import { getDb } from "../../db/mongo.js";

import config from "../../../config.json" with { type: "json" };
import type { botClient } from "../../index.js";

export const name = "ping";
export const description =
  "Connaître la latence du bot, de la base de données et de l'API de discord.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ]);

export const command = async (
  interaction: ChatInputCommandInteraction,
  bot: botClient
) => {
  const ping = Date.now() - interaction.createdTimestamp;
  await interaction.deferReply();

  const db = getDb();
  const now = Date.now();
  await db.admin().ping();
  const ping_db = Date.now() - now;
  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
        .setFields(
          {
            name: "🔷 - API Discord",
            value: `**${bot.ws.ping}** ms`,
            inline: true,
          },
          { name: ":robot: - Bot", value: `**${ping}** ms`, inline: true },
          {
            name: ":file_cabinet: - Base de données",
            value: `**${ping_db}** ms`,
            inline: true,
          }
        )
        .setFooter({
          text: `Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.avatarURL() as string,
        })
        .setTimestamp(),
    ],
  });
};
