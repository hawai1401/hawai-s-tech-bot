import type { AnyThreadChannel } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "threadUpdate";

export const event = async (
  client: botClient,
  oldThread: AnyThreadChannel,
  newThread: AnyThreadChannel
) => {};
