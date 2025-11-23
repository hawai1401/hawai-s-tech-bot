import type {
  Message,
  OmitPartialGroupDMChannel,
  PartialMessage,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "messageUpdate";
export const event = async (
  client: botClient,
  oldMessage: OmitPartialGroupDMChannel<Message | PartialMessage>,
  newMessage: OmitPartialGroupDMChannel<Message>
) => {};
