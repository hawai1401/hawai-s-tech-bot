import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";

export const type = "interactionCreate";
export const event = async (client: botClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete() || interaction.commandName !== "rappel")
    return;

  const focusedValue = interaction.options.getFocused();
  const user = interaction.user.id;
  const rappels = await getDb().Rappels.find({ user });
  if (rappels.length === 0)
    return await interaction.respond([
      { name: "Vous n'avez aucun rappel.", value: "null" },
    ]);
  const rappels_map = rappels.map((r) => {
    return {
      name: `${r.message} ${new Date(r.date * 1000).toLocaleString()}`,
      value: String(r._id),
    };
  });

  await interaction.respond(
    rappels_map.filter((r) => r.name.startsWith(focusedValue))
  );
};
