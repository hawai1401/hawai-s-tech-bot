import type { Guild } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildIntegrationsUpdate";

export const event = async (client: botClient, guild: Guild) => {};
