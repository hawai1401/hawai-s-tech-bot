import type { GuildSoundboardSound } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildSoundboardSoundCreate";

export const event = async (
  client: botClient,
  soundboardSound: GuildSoundboardSound
) => {};
