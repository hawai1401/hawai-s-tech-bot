import { EmbedBuilder, TextChannel, type AutoModerationRule } from "discord.js";
import type { botClient } from "../../../index.js";
import ms from "ms";
import config from "../../../../config.json" with { type: "json" };

export const type = "autoModerationRuleCreate";

export const event = async (
  client: botClient,
  autoModerationRule: AutoModerationRule
) => {
  const eventType = {
    1: "Envoi d'un message",
    2: "Mise à jour d'un membre",
  };
  const actionType = {
    1: "Bloquer le message",
    2: "Envoyer un message d'alerte",
    3: "Rendre muet",
    4: "Empêcher le membre d'intéragir sur le serveur",
  };
  const listenerType = {
    1: "Mots",
    3: "Spam",
    4: "Liste de mots",
    5: "Spam de mention",
    6: "Profil d'un membre",
  };
  const listName = {
    1: "Grocièretés",
    2: "Contenu NSFW",
    3: "Insultes",
  };
  const createur = await client.users.fetch(autoModerationRule.creatorId);
  const embed = new EmbedBuilder()
    .setColor(config.embed.success)
    .setAuthor({
      name: createur.username,
      iconURL: createur.displayAvatarURL(),
    })
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${autoModerationRule.id}\n**Nom** : ${
        autoModerationRule.name
      }\n**Élémént observé** : ${
        listenerType[autoModerationRule.triggerType]
      }\n**Déclencheur** : ${
        eventType[autoModerationRule.eventType]
      }\n**Status** : ${
        autoModerationRule.enabled ? "Activé" : "Désactivé"
      }\n\n**Salons ignorés** :\n${
        autoModerationRule.exemptChannels.size > 0
          ? autoModerationRule.exemptChannels
              .map((c) => `- ${c} \`${c.name}\``)
              .slice(0, 10)
              .join("\n")
          : "- Aucun"
      }${
        autoModerationRule.exemptChannels.size > 10
          ? `\n - Et ${autoModerationRule.exemptChannels.size - 10} autres...`
          : ""
      }\n\n**Rôles ignorés** :\n${
        autoModerationRule.exemptRoles.size > 0
          ? autoModerationRule.exemptRoles
              .map((r) => `- ${r} \`${r.name}\``)
              .slice(0, 10)
              .join("\n")
          : "- Aucun"
      }${
        autoModerationRule.exemptRoles.size > 10
          ? `\n- Et ${autoModerationRule.exemptRoles.size - 10} autres...`
          : ""
      }`,
    })
    .setFooter({
      text: "Nouvelle règle d'auto-modération",
      iconURL: autoModerationRule.guild.iconURL()!,
    })
    .setTimestamp();

  if (
    autoModerationRule.triggerMetadata.keywordFilter.length > 0 ||
    autoModerationRule.triggerMetadata.regexPatterns.length > 0 ||
    autoModerationRule.triggerMetadata.allowList.length > 0 ||
    autoModerationRule.triggerMetadata.mentionTotalLimit ||
    autoModerationRule.triggerMetadata.presets.length > 0
  ) {
    const getValue = () => {
      let value = [];
      if (autoModerationRule.triggerMetadata.keywordFilter.length > 0)
        value.push(
          `**Liste des mots bloqués** : ${autoModerationRule.triggerMetadata.keywordFilter
            .map((w) => `\n- ${w}`)
            .slice(0, 5)
            .join("")}${
            autoModerationRule.triggerMetadata.keywordFilter.length > 10
              ? `\n- Et ${
                  autoModerationRule.triggerMetadata.keywordFilter.length - 10
                } autres...`
              : ""
          }`
        );
      if (autoModerationRule.triggerMetadata.regexPatterns.length > 0)
        value.push(
          `**Liste des regexs bloqués** : ${autoModerationRule.triggerMetadata.regexPatterns
            .map((r) => `\n- ${r}`)
            .slice(0, 5)
            .join("")}${
            autoModerationRule.triggerMetadata.regexPatterns.length > 10
              ? `\n- Et ${
                  autoModerationRule.triggerMetadata.regexPatterns.length - 10
                } autres...`
              : ""
          }`
        );
      if (autoModerationRule.triggerMetadata.presets.length > 0)
        value.push(
          `**Liste de mots prédéfinies actives** : ${autoModerationRule.triggerMetadata.presets
            .map((l) => `\n- ${listName[l]}`)
            .join("")}`
        );
      if (autoModerationRule.triggerMetadata.allowList.length > 0)
        value.push(
          `**Liste des mots autorisés** : ${autoModerationRule.triggerMetadata.allowList
            .map((w) => `\n- ${w}`)
            .slice(0, 5)
            .join("")}${
            autoModerationRule.triggerMetadata.allowList.length > 10
              ? `\n- Et ${
                  autoModerationRule.triggerMetadata.allowList.length - 10
                } autres...`
              : ""
          }`
        );
      if (autoModerationRule.triggerMetadata.mentionTotalLimit)
        value.push(
          `**Nombre de mention maximum par message** : ${autoModerationRule.triggerMetadata.mentionTotalLimit}`
        );
      return value.join("\n\n");
    };
    embed.addFields({
      name: "🔧 - Avancé",
      value: `>>> ${getValue()}`,
    });
  }

  if (autoModerationRule.actions.length > 0)
    embed.addFields({
      name: "🛡️ - Actions",
      value: `>>> ${autoModerationRule.actions
        .map((a) => {
          let msg = `- ${actionType[a.type]}`;
          if (a.type === 1 && a.metadata.customMessage)
            msg += `\n  - Message d'explication : _${a.metadata.customMessage}_`;
          if (a.type === 2 && a.metadata.channelId)
            msg += `\n  - Salon : <#${a.metadata.channelId}>`;
          if (a.type === 3 && a.metadata.durationSeconds)
            msg += `\n  - Durée : ${ms(a.metadata.durationSeconds * 1000, {
              long: true,
            })}`;
          return msg;
        })
        .join("\n")}`,
    });

  const channel = (await client.channels.fetch(
    "1442241445670158511"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
