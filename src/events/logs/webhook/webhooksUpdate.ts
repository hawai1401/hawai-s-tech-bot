import type {
  ForumChannel,
  MediaChannel,
  NewsChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "webhookUpdate";

export const event = async (
  client: botClient,
  channel:
    | TextChannel
    | NewsChannel
    | VoiceChannel
    | ForumChannel
    | MediaChannel
) => {};
