import type { GuildEmoji } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "emojiUpdate";

export const event = async (
  client: botClient,
  oldEmoji: GuildEmoji,
  newEmoji: GuildEmoji
) => {};
