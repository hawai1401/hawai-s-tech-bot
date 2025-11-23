import type { GuildEmoji } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "emojiDelete";

export const event = async (client: botClient, emoji: GuildEmoji) => {};
