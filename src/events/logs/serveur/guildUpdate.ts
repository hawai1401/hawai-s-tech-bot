import {
  AuditLogEvent,
  EmbedBuilder,
  type Guild,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import ms from "ms";
import config from "../../../../config.json" with { type: "json" };

export const type = "guildUpdate";

export const event = async (
  client: botClient,
  oldGuild: Guild,
  newGuild: Guild
) => {
  const updated: string[] = [];
  const guildVerificationLevel = {
    0: "**Aucun** (Aucunes restrictions)",
    1: "**Basse** (Doit avoir une adresse emain vérifié)",
    2: "**Moyenne** (Doit être sur Discord depuis plus de 5 minutes)",
    3: "**Haut** (Doit être membre du serveur depuis plus de 10 minutes)",
    4: "**Très haut** (Doit avoir un numéro de téléphone vérifié)",
  };
  const guildExplicitContentFilter = {
    0: "Désactivé",
    1: "Membres sans rôle",
    2: "Tous les membres",
  };
  const guildDefaultMessageNotifications = {
    0: "Tous les messages",
    1: "Uniquement les mentions",
  };
  const guildMFALevel = {
    0: config.emojis.error,
    1: config.emojis.success,
  };
  const guildNSFWLevel = {
    0: "Normal",
    1: "Explicite",
    2: "Sûr",
    3: "Limite d'âge",
  };

  const log = await newGuild.fetchAuditLogs({
    type: AuditLogEvent.GuildUpdate,
    limit: 1,
  });
  const executor = log.entries.first()?.executor;
  if (!executor) return;

  const author = await client.users.fetch(executor.id);

  const embed = new EmbedBuilder()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(config.embed.warn)
    .setFooter({
      text: "Serveur modifié",
      iconURL: newGuild!.iconURL() ?? "",
    })
    .setTimestamp();

  if (oldGuild.name !== newGuild.name)
    updated.push(
      `**Nom** : ${oldGuild.name} ${config.emojis.arrow_right} ${newGuild.name}`
    );

  if (oldGuild.verificationLevel !== newGuild.verificationLevel)
    updated.push(
      `**Niveau de vérification** : ${
        guildVerificationLevel[oldGuild.verificationLevel]
      } ${config.emojis.arrow_right} ${
        guildVerificationLevel[newGuild.verificationLevel]
      }`
    );

  if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter)
    updated.push(
      `**Filtrer les contenus sensibles** : ${
        guildExplicitContentFilter[oldGuild.explicitContentFilter]
      } ${config.emojis.arrow_right} ${
        guildExplicitContentFilter[newGuild.explicitContentFilter]
      }`
    );

  if (oldGuild.afkTimeout !== newGuild.afkTimeout)
    updated.push(
      `**Durée maximum d'inactivité en vocal** : ${ms(
        oldGuild.afkTimeout * 1000
      )} ${config.emojis.arrow_right} ${ms(newGuild.afkTimeout * 1000)}`
    );

  if (oldGuild.features !== newGuild.features) {
    const oldFeatures = oldGuild.features.filter(
      (f) => !newGuild.features.includes(f)
    );
    const newFeatures = newGuild.features.filter(
      (f) => !oldGuild.features.includes(f)
    );

    if (oldFeatures.length > 0)
      embed.addFields({
        name: "📤 - Anciennes fonctionnalités",
        value: ">>> " + oldFeatures.map((f) => `- ${f}`).join("\n"),
      });
    if (oldFeatures.length > 0)
      embed.addFields({
        name: "📥 - Nouvelles fonctionnalités",
        value: ">>> " + newFeatures.map((f) => `- ${f}`).join("\n"),
      });
  }

  if (oldGuild.systemChannel !== newGuild.systemChannel)
    updated.push(
      `**Salon des notifications système** : ${
        oldGuild.systemChannel ?? "Aucun"
      } \`${oldGuild.systemChannel?.name ?? "Aucun"}\` ${
        config.emojis.arrow_right
      } ${newGuild.systemChannel ?? "Aucun"} \`${
        newGuild.systemChannel?.name ?? "Aucun"
      }\``
    );
  if (oldGuild.afkChannel !== newGuild.afkChannel)
    updated.push(
      `**Salon d'afk vocal** : ${oldGuild.afkChannel ?? "Aucun"} \`${
        oldGuild.afkChannel?.name ?? "Aucun"
      }\` ${config.emojis.arrow_right} ${newGuild.afkChannel ?? "Aucun"} \`${
        newGuild.afkChannel?.name ?? "Aucun"
      }\``
    );
  if (oldGuild.rulesChannel !== newGuild.rulesChannel)
    updated.push(
      `**Salon du règlement** : ${oldGuild.rulesChannel ?? "Aucun"} \`${
        oldGuild.rulesChannel?.name ?? "Aucun"
      }\` ${config.emojis.arrow_right} ${newGuild.rulesChannel ?? "Aucun"} \`${
        newGuild.rulesChannel?.name ?? "Aucun"
      }\``
    );
  if (oldGuild.safetyAlertsChannel !== newGuild.safetyAlertsChannel)
    updated.push(
      `**Salon des notifications de sécurité** : ${
        oldGuild.safetyAlertsChannel ?? "Aucun"
      } \`${oldGuild.safetyAlertsChannel?.name ?? "Aucun"}\` ${
        config.emojis.arrow_right
      } ${newGuild.safetyAlertsChannel ?? "Aucun"} \`${
        newGuild.safetyAlertsChannel?.name ?? "Aucun"
      }\``
    );
  if (oldGuild.publicUpdatesChannel !== newGuild.publicUpdatesChannel)
    updated.push(
      `**Salon des mises à jour de la communauté** : ${
        oldGuild.publicUpdatesChannel ?? "Aucun"
      } \`${oldGuild.publicUpdatesChannel?.name ?? "Aucun"}\` ${
        config.emojis.arrow_right
      } ${newGuild.publicUpdatesChannel ?? "Aucun"} \`${
        newGuild.publicUpdatesChannel?.name ?? "Aucun"
      }\``
    );

  if (oldGuild.description !== newGuild.description) {
    embed.addFields({
      name: "📤 - Ancienne description",
      value: ">>> " + (oldGuild.description ?? "Aucune"),
    });

    embed.addFields({
      name: "📥 - Nouvelle description",
      value: ">>> " + (newGuild.description ?? "Aucune"),
    });
  }

  if (oldGuild.ownerId !== newGuild.ownerId)
    embed.addFields({
      name: `👑 - Propriétaire`,
      value: `> ${oldGuild.ownerId} ${config.emojis.arrow_right} ${newGuild.ownerId}`,
    });

  if (oldGuild.preferredLocale !== newGuild.preferredLocale)
    updated.push(
      `**Langue** : ${oldGuild.preferredLocale} ${config.emojis.arrow_right} ${newGuild.preferredLocale}`
    );

  if (updated.length === 0 && !embed.data.fields) return;

  if (
    oldGuild.defaultMessageNotifications !==
    newGuild.defaultMessageNotifications
  )
    updated.push(
      `**Paramètre de notification par défaut** : ${
        guildDefaultMessageNotifications[oldGuild.defaultMessageNotifications]
      } ${config.emojis.arrow_right} ${
        guildDefaultMessageNotifications[newGuild.defaultMessageNotifications]
      }`
    );

  if (oldGuild.mfaLevel !== newGuild.mfaLevel)
    updated.push(
      `**A2F pour pouvoir faire des actions de modérateur** : ${
        guildMFALevel[oldGuild.mfaLevel]
      } ${config.emojis.arrow_right} ${guildMFALevel[newGuild.mfaLevel]}`
    );

  if (oldGuild.nsfwLevel !== newGuild.nsfwLevel)
    updated.push(
      `**Niveau NSFW** : ${guildNSFWLevel[oldGuild.nsfwLevel]} ${
        config.emojis.arrow_right
      } ${guildNSFWLevel[newGuild.nsfwLevel]}`
    );

  if (oldGuild.partnered !== newGuild.partnered)
    updated.push(
      `**Partenaire** : ${
        oldGuild.partnered ? config.emojis.success : config.emojis.error
      } ${config.emojis.arrow_right} ${
        newGuild.partnered ? config.emojis.success : config.emojis.error
      }`
    );

  if (oldGuild.premiumProgressBarEnabled !== newGuild.premiumProgressBarEnabled)
    updated.push(
      `**Barre de progression des boost** : ${
        oldGuild.premiumProgressBarEnabled ? "Activé" : "Désactivé"
      } ${config.emojis.arrow_right} ${
        newGuild.premiumProgressBarEnabled ? "Activé" : "Désactivé"
      }`
    );

  if (oldGuild.widgetEnabled !== newGuild.widgetEnabled)
    updated.push(
      `**Widget** : ${oldGuild.widgetEnabled ? "Activé" : "Désactivé"} ${
        config.emojis.arrow_right
      } ${newGuild.widgetEnabled ? "Activé" : "Désactivé"}`
    );

  if (updated.length > 0)
    embed.addFields({
      name: "✏️ - Informations modifiés",
      value: ">>> " + updated.join("\n"),
    });

  const channel = (await client.channels.fetch(
    "1453788705134346453"
  )) as TextChannel;
  channel.send({
    embeds: [embed],
  });
};
