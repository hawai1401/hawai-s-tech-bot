import type { ThreadMember } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "threadMemberUpdate";

export const event = async (
  client: botClient,
  oldMember: ThreadMember,
  newMember: ThreadMember
) => {};
