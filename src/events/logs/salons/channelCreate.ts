import type { NonThreadGuildBasedChannel } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "channelCreate";

export const event = async (
  client: botClient,
  channel: NonThreadGuildBasedChannel
) => {};
