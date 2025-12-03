import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ActionRowBuilder,
  EmbedBuilder,
  version as discordVersion,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import { platform, machine, cpus } from "os";
import { memoryUsage, version, uptime } from "process";
import { getDb } from "../../db/mongo.js";
import Button from "../../class/button.js";

export const name = "info-bot";
export const description = "Donne des informations sur le bot.";
export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ]);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const dev = await client.users.fetch("1091617877725024326");

  const db = getDb().db;
  const now = Date.now();
  await db.admin().ping();
  const ping_db = Date.now() - now;

  let duree_s = uptime();

  const jour = Math.floor(duree_s / 86400);
  duree_s -= jour * 86400;
  const heure = Math.floor(duree_s / 3600);
  duree_s -= heure * 3600;
  const minute = Math.floor(duree_s / 60);
  duree_s -= minute * 60;

  const embed = new EmbedBuilder()
    .setTitle(client.user.tag)
    .setThumbnail(client.user.avatarURL())
    .addFields({
      name: ":information_source: - Informations",
      value: `>>> **Pseudo** : ${client.user.username}#${
        client.user.discriminator
      }\n**ID** : ${client.user.id}\n**Création du compte** : <t:${Math.floor(
        client.user.createdTimestamp / 1000
      )}:F> (<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>)`,
    })
    .addFields({
      name: "<:discordearlybotdeveloper:1409160770796916847> - Développeur",
      value: `>>> **Pseudo** : ${dev.tag}\n**ID** : ${dev.id}`,
    })
    .addFields({
      name: ":desktop: - Machine",
      value: `>>> **OS** : ${platform()} (${machine()})\n**Processeur** : ${
        cpus()[0]!.model
      } (${cpus().length} vCores)\n**Ram utilisée** : ${Math.floor(
        memoryUsage().heapUsed / 100000
      )} Mo\n**Version Node.js** : ${version}\n**Version Discord.js** : ${discordVersion}`,
    })
    .addFields({
      name: ":bar_chart: - Statistiques",
      value: `>>> **Commandes** : ${
        client.application!.commands.cache.size
      }\n**Serveurs** : ${client.guilds.cache.size}\n**Utilisateurs** : ${
        client.users.cache.size
      }\n**Salons** : ${client.channels.cache.size}\n**Émojis** : ${
        client.emojis.cache.size
      }`,
      inline: true,
    })
    .addFields({
      name: ":satellite: - Autre",
      value: `>>> **Uptime** : ${jour} jours ${heure} heures ${minute} minutes ${Math.floor(
        duree_s
      )} secondes\n**Ping du bot** : ${
        client.ws.ping
      } ms\n**Ping de la base de données** : ${ping_db} ms`,
      inline: true,
    })
    .setImage(client.user.bannerURL() ?? null)
    .setColor(config.embed.normal)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  interaction.reply({
    embeds: [embed],
    components: [
      new ActionRowBuilder<Button>().addComponents(
        new Button("lien", { text: "Support" }, "https://discord.gg/CPVZ74fUdM")
      ),
    ],
  });
};
