import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";
import type { ObjectId } from "mongodb";

export const type = "interactionCreate";
export const event = async (client: botClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete() || interaction.commandName !== "rappel")
    return;

  const focusedValue = interaction.options.getFocused();
  const user = interaction.user.id;
  const rappels = (await getDb()
    .collection("Rappels")
    .find({ user })
    .toArray()) as Array<{
    _id: ObjectId;
    user: string;
    message: string;
    date: number;
  }>;
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
