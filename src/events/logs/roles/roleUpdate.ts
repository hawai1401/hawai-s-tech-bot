import type { Role } from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "roleUpdate";

export const event = async (
  client: botClient,
  oldRole: Role,
  newRole: Role
) => {};
