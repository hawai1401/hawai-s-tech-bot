import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} from "discord.js";
import { getDb } from "../../db/mongo.js";

import config from "../../../config.json" with { type: "json" };
import type { botClient } from "../../index.js";

export const name = "";
export const description = "";
export const aide = ""

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
  if (!config["owner-id"].includes(interaction.user.id))
    return await interaction.reply({
      content: `${config.emojis.warn} - Commande en développement !`,
      flags: MessageFlags.Ephemeral,
    });
};
