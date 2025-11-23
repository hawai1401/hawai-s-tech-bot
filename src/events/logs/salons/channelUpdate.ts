import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "channelUpdate";

export const event = async (
  client: botClient,
  oldChannel: DMChannel | NonThreadGuildBasedChannel,
  newChannel: DMChannel | NonThreadGuildBasedChannel
) => {};
