import type { AutoModerationRule } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "autoModerationRuleCreate";

export const event = async (
  client: botClient,
  autoModerationRule: AutoModerationRule
) => {};
