import type { AutoModerationRule } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "autoModerationRuleUpdate";

export const event = async (
  client: botClient,
  oldAutoModerationRule: AutoModerationRule | null,
  newAutoModerationRule: AutoModerationRule
) => {};
