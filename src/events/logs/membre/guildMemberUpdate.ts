import type { GuildMember, PartialGuildMember } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildMemberUpdate";

export const event = async (
  client: botClient,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember
) => {};
