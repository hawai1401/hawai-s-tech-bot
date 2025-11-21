import type {
  Message,
  OmitPartialGroupDMChannel,
  PartialMessage,
} from "discord.js";
import type { botClient } from "../../index.js";

export const type = "messageDelete";
export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>
) => {
  client.snipes.set(message.channelId, message);
};
