import type { Sticker } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "stickerCreate";

export const event = async (client: botClient, sticker: Sticker) => {};
