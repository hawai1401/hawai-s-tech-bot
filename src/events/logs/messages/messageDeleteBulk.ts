import type {
  GuildTextBasedChannel,
  Message,
  PartialMessage,
  ReadonlyCollection,
  Snowflake,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "messageDeleteBulk";
export const event = async (
  client: botClient,
  messages: ReadonlyCollection<Snowflake, Message<true> | PartialMessage<true>>,
  channel: GuildTextBasedChannel
) => {};
