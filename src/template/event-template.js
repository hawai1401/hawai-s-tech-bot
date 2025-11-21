import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";

export const type = "interactionCreate";

export const event = async (client: botClient, interaction: Interaction) => {};
