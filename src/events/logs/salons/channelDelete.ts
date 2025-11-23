import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "channelDelete";

export const event = async (
  client: botClient,
  channel: DMChannel | NonThreadGuildBasedChannel
) => {};
