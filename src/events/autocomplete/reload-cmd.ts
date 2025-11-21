import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";
import fs from "fs";

export const type = "interactionCreate";
export const event = async (client: botClient, interaction: Interaction) => {
  if (!interaction.isAutocomplete() || interaction.commandName !== "reload-cmd")
    return;

  const focusedValue = interaction.options.getFocused();

  const cmds: Array<{ name: string; value: string }> = [];

  for (const folderName of fs.readdirSync("./dist/commands", {
    encoding: "utf-8",
  })) {
    const commands = fs.readdirSync(`./dist/commands/${folderName}`, {
      encoding: "utf-8",
    });
    for (const c of commands) {
      if (c.endsWith(".js"))
        cmds.push({ name: c, value: `../../commands/${folderName}/${c}` });
    }
  }

  await interaction.respond(
    cmds.filter((c) => c.name.startsWith(focusedValue)).slice(0, 25)
  );
};
