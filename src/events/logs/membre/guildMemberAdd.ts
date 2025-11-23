import type { GuildMember } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "guildMemberAdd";

export const event = async (client: botClient, member: GuildMember) => {};
