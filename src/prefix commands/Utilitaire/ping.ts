import {
  EmbedBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { getDb } from "../../db/mongo.js";
import config from "../../../config.json" with { type: "json" };
import type { botClient, prefixCommand_data } from "../../index.js";

export const data: prefixCommand_data = {
  name: "ping",
  description:
    "Connaître la latence du bot, de la base de données et de l'API de discord.",
  alias: ["latence"],
};

export const command = async (
  bot: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const db = getDb().db;
  const now = performance.now();
  await db.admin().ping();
  const ping_db = performance.now() - now;

  const start = performance.now();
  await fetch("https://discord.com/api");
  const ping_api = (performance.now() - start) / 2;

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(config.embed.normal)
        .setFields(
          {
            name: "🔷 - API Discord",
            value: `**${ping_api.toFixed(2)}** ms`,
          },
          { name: ":robot: - Bot", value: `**${bot.ws.ping}** ms` },
          {
            name: ":file_cabinet: - Base de données",
            value: `**${ping_db.toFixed(2)}** ms`,
          }
        )
        .setFooter({
          text: `Demandé par ${message.author.tag}`,
          iconURL: message.author.avatarURL() as string,
        })
        .setTimestamp(),
    ],
  });
};
