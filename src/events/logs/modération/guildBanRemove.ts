import type { GuildBan } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildBanRemove";

export const event = async (client: botClient, ban: GuildBan) => {};
