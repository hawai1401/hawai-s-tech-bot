import type { Role } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "roleCreate";

export const event = async (client: botClient, role: Role) => {};
