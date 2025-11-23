import type { GuildMember } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildMemberRemove";

export const event = async (client: botClient, member: GuildMember) => {};
