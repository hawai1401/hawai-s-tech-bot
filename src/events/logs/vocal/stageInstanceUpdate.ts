import type { StageInstance } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "stageInstanceUpdate";

export const event = async (
  client: botClient,
  oldStageInstance: StageInstance | null,
  newStageInstance: StageInstance
) => {};
