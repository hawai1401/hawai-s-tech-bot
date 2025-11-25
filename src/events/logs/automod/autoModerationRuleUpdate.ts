import {
  AutoModerationRuleKeywordPresetType,
  EmbedBuilder,
  type AutoModerationRule,
  type Snowflake,
  type TextChannel,
} from "discord.js";
import type { botClient } from "../../../index.js";
import ms from "ms";
import config from "../../../../config.json" with { type: "json" };

export const type = "autoModerationRuleUpdate";

export const event = async (
  client: botClient,
  oldAutoModerationRule: AutoModerationRule | null,
  newAutoModerationRule: AutoModerationRule
) => {
  if (!oldAutoModerationRule) return;

  const actionType: {
    [key: number]: string;
    1: string;
    2: string;
    3: string;
    4: string;
  } = {
    1: "Bloquer le message",
    2: "Envoyer un message d'alerte",
    3: "Rendre muet",
    4: "Empêcher le membre d'intéragir sur le serveur",
  };
  const listName = {
    1: "Grocièretés",
    2: "Contenu NSFW",
    3: "Insultes",
  };
  const getInfo = () => {
    const value = [];
    if (oldAutoModerationRule.name !== newAutoModerationRule.name)
      value.push(
        `**Nom** : ${oldAutoModerationRule.name} ${config.emojis.arrow_right} ${newAutoModerationRule.name}`
      );
    if (oldAutoModerationRule.enabled !== newAutoModerationRule.enabled)
      value.push(
        `**Status** : ${
          oldAutoModerationRule.enabled ? "Activé" : "Désactivé"
        } ${config.emojis.arrow_right} ${
          newAutoModerationRule.enabled ? "Activé" : "Désactivé"
        }`
      );
    if (value.length > 0) return "\n" + value.join("\n");
    return `\n**Nom** : ${newAutoModerationRule.name}`;
  };
  const getChannels = () => {
    const value = ["**Salons ignorés** :"];

    const oldChannels = oldAutoModerationRule.exemptChannels.filter((c1) =>
      newAutoModerationRule.exemptChannels.find((c2) => c2 === c1)
        ? false
        : true
    );
    const newChannels = newAutoModerationRule.exemptChannels.filter((c1) =>
      oldAutoModerationRule.exemptChannels.find((c2) => c2 === c1)
        ? false
        : true
    );

    if (oldChannels.size > 0)
      value.push(
        `${oldChannels
          .map((c) => `${config.emojis.error} ${c} \`${c.name}\``)
          .slice(0, 10)
          .join("\n")}${
          oldChannels.size > 10
            ? `\n - Et ${oldChannels.size - 10} autres...`
            : ""
        }`
      );
    if (newChannels.size > 0)
      value.push(
        `${newChannels
          .map((c) => `${config.emojis.success} ${c} \`${c.name}\``)
          .slice(0, 10)
          .join("\n")}${
          newChannels.size > 10
            ? `\n - Et ${newChannels.size - 10} autres...`
            : ""
        }`
      );

    if (value.length > 1) return "\n\n" + value.join("\n");
    return "";
  };
  const getRoles = () => {
    const value = ["**Rôles ignorés** :"];

    const oldRoles = oldAutoModerationRule.exemptRoles.filter((r1) =>
      newAutoModerationRule.exemptRoles.find((r2) => r2 === r1) ? false : true
    );
    const newRoles = newAutoModerationRule.exemptRoles.filter((r1) =>
      oldAutoModerationRule.exemptRoles.find((r2) => r2 === r1) ? false : true
    );

    if (oldRoles.size > 0)
      value.push(
        `${oldRoles
          .map((r) => `${config.emojis.error} ${r} \`${r.name}\``)
          .slice(0, 10)
          .join("\n")}${
          oldRoles.size > 10 ? `\n - Et ${oldRoles.size - 10} autres...` : ""
        }`
      );
    if (newRoles.size > 0)
      value.push(
        `${newRoles
          .map((r) => `${config.emojis.success} ${r} \`${r.name}\``)
          .slice(0, 10)
          .join("\n")}${
          newRoles.size > 10 ? `\n - Et ${newRoles.size - 10} autres...` : ""
        }`
      );

    if (value.length > 1) return "\n\n" + value.join("\n");
    return "";
  };
  const getTriggerMetadata = () => {
    const keys = {
      keywordFilter: "mots bloqués",
      regexPatterns: "regex bloqués",
      allowList: "mots autorisés",
    };
    interface triggerMetadata {
      [key: string]:
        | readonly string[]
        | readonly AutoModerationRuleKeywordPresetType[]
        | number
        | null
        | boolean;
      keywordFilter: readonly string[];
      regexPatterns: readonly string[];
      presets: readonly AutoModerationRuleKeywordPresetType[];
      allowList: readonly string[];
      mentionTotalLimit: number | null;
      mentionRaidProtectionEnabled: boolean;
    }
    const value: Array<string> = [];
    for (const key in newAutoModerationRule.triggerMetadata) {
      if (!Object.hasOwn(newAutoModerationRule.triggerMetadata, key)) continue;

      const element = (
        newAutoModerationRule.triggerMetadata as triggerMetadata
      )[key];
      if (!element) continue;

      if (
        key === "keywordFilter" ||
        key === "regexPatterns" ||
        key === "allowList"
      ) {
        const v = [`**Liste des ${keys[key]}** :\n`];
        const before = oldAutoModerationRule.triggerMetadata[key].filter((w1) =>
          (element as readonly string[]).find((w2) => w2 === w1) ? false : true
        );
        const after = (element as readonly string[]).filter((w1) =>
          oldAutoModerationRule.triggerMetadata[key].find((w2) => w2 === w1)
            ? false
            : true
        );

        if (before.length > 0)
          v.push(
            `${before
              .map((w) => `${config.emojis.error} ${w}`)
              .slice(0, 5)
              .join("\n")}${
              before.length > 5 ? `\n - Et ${before.length - 5} autres...` : ""
            }`
          );
        if (after.length > 0)
          v.push(
            `${after
              .map((w) => `${config.emojis.success} ${w}`)
              .slice(0, 5)
              .join("\n")}${
              after.length > 5 ? `\n - Et ${after.length - 5} autres...` : ""
            }`
          );

        if (v.length > 1) value.push(v.join("\n"));
      }
      if (key === "presets") {
        const v = [`**Liste de mots prédéfinies actives** :`];
        const before = oldAutoModerationRule.triggerMetadata[key].filter((l1) =>
          (element as readonly AutoModerationRuleKeywordPresetType[]).find(
            (l2) => l2 === l1
          )
            ? false
            : true
        );
        const after = (
          element as readonly AutoModerationRuleKeywordPresetType[]
        ).filter((l1) =>
          oldAutoModerationRule.triggerMetadata[key].find((l2) => l2 === l1)
            ? false
            : true
        );

        if (before.length > 0)
          v.push(
            `${before
              .map((l) => `${config.emojis.error} ${listName[l]}`)
              .join("\n")}`
          );
        if (after.length > 0)
          v.push(
            `${after
              .map(
                (l: AutoModerationRuleKeywordPresetType) =>
                  `${config.emojis.success} ${listName[l]}`
              )
              .join("\n")}`
          );

        if (v.length > 1) value.push(v.join("\n"));
      }

      if (key === "mentionTotalLimit") {
        const before =
          oldAutoModerationRule.triggerMetadata.mentionTotalLimit ?? "Aucune";
        const after = element as number;

        if (before === after) continue;

        value.push(
          `**Limite de mention** : ${before} ${config.emojis.arrow_right} ${after}`
        );
      }
    }

    return value.join("\n\n");
  };

  const getActions = () => {
    const value: Array<string> = [];
    const before: Array<[number, string]> = [];
    const after: Array<[number, string]> = [];
    interface AutoModerationActionMetadata {
      [key: string]: Snowflake | number | string | null;
      channelId: Snowflake | null;
      durationSeconds: number | null;
      customMessage: string | null;
    }

    oldAutoModerationRule.actions.forEach((a) => {
      for (const k in a.metadata) {
        if (!Object.hasOwn(a.metadata, k)) continue;
        const element = (a.metadata as AutoModerationActionMetadata)[k];
        if (!element) continue;
        before.push([a.type, String(element)]);
      }
    });
    newAutoModerationRule.actions.forEach((a) => {
      for (const k in a.metadata) {
        if (!Object.hasOwn(a.metadata, k)) continue;
        const element = (a.metadata as AutoModerationActionMetadata)[k];
        if (!element) continue;
        after.push([a.type, String(element)]);
      }
    });
    for (let i = 1; i <= 3; i++) {
      const b = before.find((a) => a[0] === i);
      const a = after.find((a) => a[0] === i);
      let v = `${
        b && !a ? config.emojis.error : !b && a ? config.emojis.success : ""
      } ${actionType[i]}`;
      if ((!b && !a) || (b && a && b[1] === a[1])) continue;
      if (b && !a) {
        if (b[0] === 1)
          v += `\n- ${config.emojis.error} Message d'explication : _${b[1]}_`;
        if (b[0] === 2) v += `\n- ${config.emojis.error} Salon : <#${b[1]}>`;
        if (b[0] === 3)
          v += `\n- ${config.emojis.error} Durée : ${ms(Number(b[1]) * 1000, {
            long: true,
          })}`;
        value.push(v);
        continue;
      }
      if (!b && a) {
        if (a[0] === 1)
          v += `\n- ${config.emojis.success} Message d'explication : _${a[1]}_`;
        if (a[0] === 2) v += `\n- ${config.emojis.success} Salon : <#${a[1]}>`;
        if (a[0] === 3)
          v += `\n- ${config.emojis.success} Durée : ${ms(Number(a[1]) * 1000, {
            long: true,
          })}`;
        value.push(v);
        continue;
      }
      if (a && b) {
        if (a[0] === 1)
          v += `\n- Message d'explication : _${b[1]}_ ${config.emojis.arrow_right} _${a[1]}_`;
        if (a[0] === 2)
          v += `\n- Salon : <#${b[1]}> ${config.emojis.arrow_right} <#${a[1]}>`;
        if (a[0] === 3)
          v += `\n- Durée : ${ms(Number(b[1]) * 1000, {
            long: true,
          })} ${config.emojis.arrow_right} ${ms(Number(a[1]) * 1000, {
            long: true,
          })}`;
        value.push(v);
      }
    }
    return value.join("\n");
  };

  const createur = await client.users.fetch(oldAutoModerationRule.creatorId);
  const embed = new EmbedBuilder()
    .setColor(config.embed.warn)
    .setAuthor({
      name: createur.username,
      iconURL: createur.displayAvatarURL(),
    })
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${
        oldAutoModerationRule.id
      }${getInfo()}${getChannels()}${getRoles()}`,
    })
    .setFooter({
      text: "Règle d'auto-modération modifiée",
      iconURL: oldAutoModerationRule.guild.iconURL()!,
    })
    .setTimestamp();

  if (getTriggerMetadata().length > 0)
    embed.addFields({
      name: "🔧 - Avancé",
      value: `>>> ${getTriggerMetadata()}`,
    });
  if (getActions().length > 0)
    embed.addFields({
      name: "🛡️ - Actions",
      value: `>>> ${getActions()}`,
    });

  const channel = (await client.channels.fetch(
    "1442241445670158511"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
