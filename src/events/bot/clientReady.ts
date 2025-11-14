import { ActivityType, Collection, EmbedBuilder } from "discord.js";
import type { botClient } from "../../index.js";
import { deployementSlash } from "../../handlers/slashCommands.js";
import config from "../../../config.json" with { type: "json" };
import { erreur } from "../../logger.js";

export const type = "clientReady";

export const event = async (client: botClient) => {
  console.log(`${client.user!.tag} est en ligne !`);

  client.user!.setPresence({
    activities: [
      {
        name: "Hawai's Panel",
        type: ActivityType.Streaming,
        url: "https://twitch.tv/hawai1401",
      },
    ],
  });

  // Déployer les slash commandes
  client.commands = new Collection();
  deployementSlash(client);

  // Anti-Crash
  process.on("uncaughtException", async (err, origin) => {
    erreur(origin, err);
    const salon = await client.channels.fetch("1413831946492055552");
    const embed = new EmbedBuilder()
      .setTitle(`[ ANTI-CRASH ] - ${origin}`)
      .setDescription(
        "```js\n" + (err.stack || err.toString()).slice(0, 4000) + "```"
      )
      .setColor(config.embed.error)
      .setTimestamp();
    (salon as any).send({ embeds: [embed] });
  });
  process.on("uncaughtExceptionMonitor", async (err, origin) => {
    erreur(origin, err);
    const salon = await client.channels.fetch("1413831946492055552");
    const embed = new EmbedBuilder()
      .setTitle(`[ ANTI-CRASH ] - ${origin}`)
      .setDescription(
        "```js\n" + (err.stack || err.toString()).slice(0, 4000) + "```"
      )
      .setColor(config.embed.error)
      .setTimestamp();
    (salon as any).send({ embeds: [embed] });
  });
  process.on("unhandledRejection", async (err, promise) => {
    erreur(promise, err);

    const salon = await client.channels.fetch("1413831946492055552");

    const embed = new EmbedBuilder()
      .setTitle("[ ANTI-CRASH ] - unhandledRejection")
      .setColor(config.embed.error)
      .setTimestamp();

    if (err instanceof Error) {
      embed.setFields(
        { name: "Message", value: `\`\`\`js\n${err.message}\`\`\`` },
        {
          name: "Stack",
          value: `\`\`\`js\n${(err.stack || "").slice(0, 1000)}\`\`\``,
        }
      );
    } else {
      embed.setDescription("```js\n" + String(err).slice(0, 4000) + "```");
    }
    (salon as any).send({ embeds: [embed] });
  });
};
