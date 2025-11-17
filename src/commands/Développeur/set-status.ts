import {
  ActivityType,
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";

import config from "../../../config.json" with { type: "json" };

export const name = "set-status";
export const description = "[ DEV ] Changer le statut du bot.";

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
  ])
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Le type d'activité.")
      .setChoices(
        { name: "Competing", value: "Competing" },
        { name: "Listening", value: "Listening" },
        { name: "Watching", value: "Watching" },
        { name: "Playing", value: "Playing" },
        { name: "Streaming", value: "Streaming" },
        { name: "Custom", value: "Custom" }
      )
      .setRequired(true)
  )

  .addStringOption((option) =>
    option
      .setName("contenu")
      .setDescription("Le contenu de l'activité.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("status")
      .setDescription("Le status du bot.")
      .setChoices(
        { name: "En ligne", value: "online" },
        { name: "Inactif", value: "idle" },
        { name: "Ne pas déranger", value: "dnd" },
        { name: "Hors-ligne", value: "invisible" }
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("lien").setDescription("Le lien du statut stream.")
  );

export const command = async (
  interaction: ChatInputCommandInteraction,
  client: botClient,
) => {
  if (!config["owner-id"].includes(interaction.user.id))
    return await interaction.reply("Vous n'êtes pas développeur du bot !");

  const type_activite = interaction.options.getString("type", true) as
    | "Competing"
    | "Listening"
    | "Watching"
    | "Playing"
    | "Streaming"
    | "Custom";
  const contenu_activite = interaction.options.getString("contenu", true);
  const status = interaction.options.getString("status", true) as
    | "online"
    | "idle"
    | "dnd"
    | "invisible";
  const url = interaction.options.getString("lien");

  const options = {
    status,
    activities: [
      {
        name: contenu_activite,
        type: ActivityType[type_activite],
        url: "",
      },
    ],
  };

  if (url) options.activities[0]!.url = url;

  client.user.setPresence(options);

  await interaction.reply({
    content: "La présence a bien été mise à jour.",
    flags: MessageFlags.Ephemeral,
  });
};
