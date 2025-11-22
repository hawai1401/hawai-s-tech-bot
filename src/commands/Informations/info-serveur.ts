import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import { ActionRowBuilder } from "discord.js";
import Button from "../../class/button.js";
import config from "../../../config.json" with { type: "json" };
import erreur from "../../functions/error.js";

export const name = "info-serveur";
export const description = "Donne des informations sur un serveur.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addStringOption((option) =>
    option
      .setName("serveur_id")
      .setDescription(
        "L'identifiant du serveur dont vous souhaitez avoir les informations."
      )
      .setRequired(false)
  )
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
  if (!interaction.inCachedGuild())
    return erreur(
      "Merci de faire la commande dans un serveur ou de remplire l'option `serveur_id`",
      interaction
    );
  const guild: Guild | null = await new Promise(async (res) => {
    try {
      res(
        await client.guilds.fetch(
          interaction.options.getString("serveur_id") || interaction.guildId
        )
      );
    } catch {
      res(null);
    }
  });

  if (!guild)
    return erreur(
      "Impossible d'obtenir des informations sur ce serveur.\n> Je ne peux obtenir des informations que sur les serveurs où je suis.",
      interaction
    );

  const features = guild.features.map((f) => `- ${f}`);

  let online = 0,
    idle = 0,
    dnd = 0,
    web = 0,
    desktop = 0,
    mobile = 0;
  for (const [_, p] of guild.presences.cache) {
    switch (p.status) {
      case "online":
        online++;
        break;
      case "idle":
        idle++;
        break;
      case "dnd":
        dnd++;
        break;

      default:
        break;
    }

    for (const c in p.clientStatus) {
      switch (c) {
        case "web":
          web++;
          break;
        case "desktop":
          desktop++;
          break;
        case "mobile":
          mobile++;
          break;

        default:
          break;
      }
    }
  }

  let nbr_roles = 0,
    nbr_roles_bot = 0;
  for (const element of guild.roles.cache) {
    if (element[1].tags?.botId) {
      nbr_roles_bot++;
    } else {
      nbr_roles++;
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(guild.name)
    .addFields({
      name: ":information_source: - Informations",
      value: `>>> ID : **${guild.id}**\n${
        guild.description !== null
          ? `Description : **${guild.description}**\n`
          : config.emojis.error
      }Langue du serveur : **${guild.preferredLocale}**\nPropriétaire : <@${
        guild.ownerId
      }> (${guild.ownerId})\n\nCréé le : **<t:${Math.floor(
        guild.createdTimestamp / 1000
      )}:F>** (*<t:${Math.floor(
        guild.createdTimestamp / 1000
      )}:R>*)\nNiveau de sécurité : **${guild.verificationLevel}**${
        guild.rulesChannelId
          ? `\nRèglement : **<#${guild.rulesChannelId}>**`
          : ""
      }${
        guild.afkChannelId
          ? `\nSalon vocal d'afk : **<#${guild.afkChannelId}>**`
          : ""
      }`,
    })
    .addFields({
      name: "📊・Statistiques",
      value: `>>> Niveau de boosts : **${guild.premiumTier}** (*${
        guild.premiumSubscriptionCount
      } boosts*)\nMembres : **${
        guild.memberCount
      } (*dont ${nbr_roles_bot} bots*)**\nRôles : **${nbr_roles}**\nSalons : **${
        guild.channels.channelCountWithoutThreads
      }**\nThreads : **${
        guild.channels.cache.size - guild.channels.channelCountWithoutThreads
      }**\nÉmojis : **${guild.emojis.cache.size}**\nAutocollants : **${
        guild.stickers.cache.size
      }**`,
    })
    .setThumbnail(guild.iconURL())
    .setImage(guild.bannerURL())
    .setTimestamp()
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setColor(config.embed.normal);

  if (features[0])
    embed.addFields({
      name: "🆕 - Fonctionnalités",
      value: `>>> ${features.join("\n")}`,
    });

  const row = new ActionRowBuilder<Button>();
  if (guild.iconURL())
    row.addComponents(new Button("lien", { text: "Icône" }, guild.iconURL()!));
  if (guild.bannerURL())
    row.addComponents(
      new Button("lien", { text: "Bannière" }, guild.bannerURL()!)
    );
  const embed2 = new EmbedBuilder()
    .setTitle("Statistiques avancées")
    .addFields({
      name: "⚪ - Status",
      value: `>>> 🟢 En ligne : **${online}**\n🟠 Inactif : **${idle}**\n🔴 Ne pas déranger : **${dnd}**\n🔘 Hors-ligne : **${
        guild.memberCount - (online + idle + dnd)
      }**`,
      inline: true,
    })
    .addFields({
      name: "🖥 - Appareils",
      value: `>>> 📱 Téléphone : **${mobile}**\n🌐 Navigateur : **${web}**\n💻 Ordinateur : **${desktop}**`,
      inline: true,
    })
    .setColor(config.embed.normal);
  if (row.components.length > 0) {
    await interaction.reply({
      embeds: [embed, embed2],
      components: [row],
    });
  } else {
    await interaction.reply({
      embeds: [embed, embed2],
    });
  }
};
