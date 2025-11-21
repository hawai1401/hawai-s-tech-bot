import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} from "discord.js";
import { getDb } from "../../db/mongo.js";

// import config from "../../../config.json" with { type: "json" };
import type { botClient } from "../../index.js";

export const name = "";
export const description = "";

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
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {};
