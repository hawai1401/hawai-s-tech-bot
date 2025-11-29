import type { botClient } from "../index.js";
import * as logs from "../logger.js";
import fs from "fs";

export const deployementPrefix = async (bot: botClient) => {
  const categorie = fs.readdirSync("./dist/prefix commands", {
    encoding: "utf-8",
  });

  for (const folderName of categorie) {
    const commands = fs.readdirSync(`./dist/prefix commands/${folderName}`, {
      encoding: "utf-8",
    });
    for (const command of commands) {
      if (command.endsWith(".js")) {
        const actual_command = await import(
          `../prefix commands/${folderName}/${command}`
        );
        if (actual_command.data) {
          // Config la commande
          try {
            bot.prefixCommands.set(actual_command.data, actual_command.command);
            logs.deployementPrefix(actual_command.data.name, true);
          } catch (error) {
            // Gestion des erreurs
            logs.deployementPrefix(actual_command.data.name, false);

            console.error(`Une erreur est survenue avec une commande !`);
            console.group();
            console.log(`Commande : ${command}`);
            console.log(`Raison : Impossible de set la commande`);
            console.log(`Erreur : ${error}`);
            console.groupEnd();
          }
        } else {
          // Gestion des erreurs
          logs.deployementPrefix(
            command.slice(command.length, command.length - 3),
            false
          );

          console.error(`Une erreur est survenue avec une commande !`);
          console.group();
          console.log(`Raison : Des propriétées sont manquantes.`);
          console.log(`Emplacement : /prefix commands/${folderName}/`);
          console.log(`Fichier : ${command}`);
          console.groupEnd();
        }
      } else {
        // Gestion des erreurs
        console.info(`Un fichier inconnu a été trouvé !`);
        console.group();
        console.log(`Emplacement : /prefix commands/${folderName}/`);
        console.log(`Fichier : ${command}`);
        console.groupEnd();
      }
    }
  }
};
