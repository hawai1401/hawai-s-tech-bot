import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";

import { eventSlash } from "../../logger.js";

export const type = "interactionCreate";
type command = (interaction: Interaction, client: botClient) => Promise<string>;

export const event = async (interaction: Interaction, client: botClient) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) return;
  try {
    eventSlash(
      interaction.commandName,
      interaction.user.tag,
      interaction.user.id,
      interaction.guild!.name,
      interaction.guildId!
    );
  } catch {
    eventSlash(
      interaction.commandName,
      interaction.user.tag,
      interaction.user.id,
      "",
      interaction.guildId!
    );
  }

  await (command as command)(interaction, client);
};
