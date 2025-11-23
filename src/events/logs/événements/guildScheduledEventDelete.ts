import type {
  GuildScheduledEvent,
  PartialGuildScheduledEvent,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildScheduledEventDelete";

export const event = async (
  client: botClient,
  guildScheduledEvent: GuildScheduledEvent | PartialGuildScheduledEvent
) => {};
