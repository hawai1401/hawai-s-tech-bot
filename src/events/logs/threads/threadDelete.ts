import type { AnyThreadChannel } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "threadDelete";

export const event = async (client: botClient, thread: AnyThreadChannel) => {};
