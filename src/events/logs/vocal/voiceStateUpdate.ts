import type { VoiceState } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "voiceStateUpdate";

export const event = async (
  client: botClient,
  oldState: VoiceState,
  newState: VoiceState
) => {};
