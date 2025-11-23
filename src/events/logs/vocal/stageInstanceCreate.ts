import type { StageInstance } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "stageInstanceCreate";

export const event = async (
  client: botClient,
  stageInstance: StageInstance
) => {};
