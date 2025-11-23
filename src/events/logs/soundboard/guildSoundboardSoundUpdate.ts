import type { GuildSoundboardSound } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildSoundboardSoundUpdate";

export const event = async (
  client: botClient,
  oldSoundboardSound: GuildSoundboardSound | null,
  newSoundboardSound: GuildSoundboardSound
) => {};
