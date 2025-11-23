import type { Invite } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "inviteDelete";

export const event = async (client: botClient, invite: Invite) => {};
