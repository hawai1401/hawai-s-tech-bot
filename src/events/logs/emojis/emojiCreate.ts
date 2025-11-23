import type { GuildEmoji } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "emojiCreate";

export const event = async (client: botClient, emoji: GuildEmoji) => {};
