import type { Guild } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildUpdate";

export const event = async (
  client: botClient,
  oldGuild: Guild,
  newGuild: Guild
) => {};
