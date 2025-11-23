import type { GuildScheduledEvent } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildScheduledEventCreate";

export const event = async (
  client: botClient,
  guildScheduledEvent: GuildScheduledEvent
) => {};
