import type { GuildSoundboardSound, PartialSoundboardSound } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildSoundboardSoundDelete";

export const event = async (
  client: botClient,
  soundboardSound: GuildSoundboardSound | PartialSoundboardSound
) => {};
