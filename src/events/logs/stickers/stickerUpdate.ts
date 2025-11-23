import type { Sticker } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "stickerUpdate";

export const event = async (
  client: botClient,
  oldSticker: Sticker,
  newSticker: Sticker
) => {};
