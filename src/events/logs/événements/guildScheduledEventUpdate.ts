import type {
  GuildScheduledEvent,
  PartialGuildScheduledEvent,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildScheduledEventUpdate";

export const event = async (
  client: botClient,
  oldGuildScheduledEvent:
    | GuildScheduledEvent
    | PartialGuildScheduledEvent
    | null,
  newGuildScheduledEvent: GuildScheduledEvent
) => {};
