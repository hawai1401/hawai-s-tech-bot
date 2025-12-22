import { ActivityType, EmbedBuilder, MessageFlags } from "discord.js";
import type { botClient } from "../../index.js";
import { deployementSlash } from "../../handlers/slashCommands.js";
import config from "../../../config.json" with { type: "json" };
import { erreur } from "../../logger.js";
import { getDb } from "../../db/mongo.js";
import mongoose from "mongoose";
import Container from "../../class/container.js";
import { deployementPrefix } from "../../handlers/prefixCommands.js";

export async function handleStop(salon: any) {
  console.log("Déconnexion de la base de donnée...");
  await mongoose.disconnect();
  console.log("Base de donnée déconnectée avec succès !");
  console.log("Envoi du message sur discord...");
  await salon.send({
    components: [new Container("warn").addText("### Arrêt du bot en cours...")],
    flags: MessageFlags.IsComponentsV2,
  });
  console.log("Message envoyé avec succès !");
  console.log("Arrêt du bot...");
  process.exit(0);
}

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
  await deployementSlash(client);

  // Déployer les prefix commandes
  await deployementPrefix(client);

  // Mise en place des rappels
  const db = getDb().Rappels;
  setInterval(async () => {
    const rappels = await db.find({
      $expr: { $lt: ["$date", Date.now() / 1000] },
    });
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
  const salon = await client.channels.fetch("1413831946492055552");
  process.on("uncaughtException", async (err, origin) => {
    erreur(origin, err);
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
  client.on("error", async (e) => {
    console.error(e);
    const embed = new EmbedBuilder()
      .setTitle("[ ANTI-CRASH ] - Erreur du bot")
      .setColor(config.embed.error)
      .setTimestamp();

    embed.setFields(
      { name: "Message", value: `\`\`\`js\n${e.message}\`\`\`` },
      {
        name: "Stack",
        value: `\`\`\`js\n${(e.stack || "").slice(0, 1000)}\`\`\``,
      }
    );

    (salon as any).send({ embeds: [embed] });
  });

  // Autre
  client.on("warn", async (w) => {
    const embed = new EmbedBuilder()
      .setTitle("[ WARN ] - Avertissement du bot")
      .setColor(config.embed.warn)
      .setTimestamp();

    embed.setFields({ name: "Message", value: `\`\`\`js\n${w}\`\`\`` });

    (salon as any).send({ embeds: [embed] });
  });
  process.on("warning", async (w) => {
    const embed = new EmbedBuilder()
      .setTitle("[ WARN ] - Avertissement")
      .setColor(config.embed.warn)
      .setTimestamp();

    embed.setFields({ name: "Message", value: `\`\`\`js\n${w}\`\`\`` });

    (salon as any).send({ embeds: [embed] });
  });
  process.on("message", async (m) => {
    const embed = new EmbedBuilder()
      .setTitle("[ MESSAGE ] - Message")
      .setColor(config.embed.normal)
      .setTimestamp();

    embed.setFields({ name: "Message", value: `\`\`\`js\n${m}\`\`\`` });

    (salon as any).send({ embeds: [embed] });
  });
  process.on("disconnect", () => {
    console.log("c");
  });
  const stop_event = ["SIGINT", "SIGABRT", "SIGTERM"];
  for (const e of stop_event) process.on(e, () => handleStop(salon));

  await (salon as any).send({
    components: [new Container("success").addText("### Bot démarré avec succès !")],
    flags: MessageFlags.IsComponentsV2,
  });
};
