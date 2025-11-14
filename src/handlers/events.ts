import type { botClient } from "../index.js";
import * as logs from "../logger.js";
import buttonInteraction from "../events/buttons/interactionCreate.js";
import fs from "fs";

export const deployementEvent = async (bot: botClient) => {
  const categorie = fs.readdirSync("./dist/events", { encoding: "utf-8" });

  for (const folderName of categorie) {
    if (folderName === "buttons") continue;
    const events = fs.readdirSync(`./dist/events/${folderName}`, {
      encoding: "utf-8",
    });
    for (const event of events) {
      if (event.endsWith(".js")) {
        const actual_event = await import(`../events/${folderName}/${event}`);

        // Config l'event
        try {
          bot.on(actual_event.type, (...args: any) =>
            actual_event.event(...args, bot)
          );
          logs.deployementEvent(event.slice(0, event.length - 3), true);
        } catch (error) {
          // Gestion des erreurs
          logs.deployementEvent(event.slice(0, event.length - 3), false);

          console.error(`Une erreur est survenue avec un event !`);
          console.group();
          console.log(`Event : ${event}`);
          console.log(`Raison : Impossible de set l'event`);
          console.log(`Erreur : ${error}`);
          console.groupEnd();
        }
      }
    }
  }
  bot.on("interactionCreate", (interaction) =>
    buttonInteraction(interaction, bot)
  );
};
