import { ActivityType, Collection, EmbedBuilder } from "discord.js";
import type { botClient } from "../../index.js";
import { deployementSlash } from "../../handlers/slashCommands.js";
import config from "../../../config.json" with { type: "json" };
import { erreur } from "../../logger.js";
import { getDb } from "../../db/mongo.js";

export const type = "clientReady";

export const event = async (client: botClient) => {
  console.log(`${client.user!.tag} est en ligne !`);

  client.user!.setPresence({
    activities: [
      {
        name: "Hawai's Tech",
        type: ActivityType.Streaming,
        url: "https://twitch.tv/hawai1401",
      },
    ],
  });

  // Déployer les slash commandes
  client.commands = new Collection();
  deployementSlash(client);

  // Mise en place des rappels
  const db = getDb().Rappels;
  setInterval(async () => {
    const rappels = await db
      .find({ $expr: { $lt: ["$date", Date.now()] } })
    if (!rappels[0]) return;
    for (const r of rappels) {
      const user = await client.users.fetch(r.user);
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed.normal)
            .setTitle("🔔 - Rappel")
            .setDescription(r.message),
        ],
      });
      await db.deleteOne({ _id: r._id });
    }
  }, 60_000);

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
