import {
  ApplicationIntegrationType,
  ButtonBuilder,
  InteractionContextType,
  SectionBuilder,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type APIContainerComponent,
  type ComponentEmojiResolvable,
} from "discord.js";
import fs from "fs";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import Container from "../../class/container.js";
import selectMenuOption from "../../class/selectMenuOption.js";

export const name = "aide";
export const description = "Afficher la liste des commandes.";

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
  interaction: ChatInputCommandInteraction,
) => {
  const cats: Record<string, { emoji: ComponentEmojiResolvable }> = {
    Accueil: { emoji: "🏠" },
    Développeur: {
      emoji: "<:activedeveloper:1409160797346857112>",
    },
    Économie: { emoji: "🪙" },
    Informations: {
      emoji: "ℹ️",
    },
    Modération: { emoji: "🛡️" },
    Utilitaire: { emoji: "📡" },
    Message: {emoji: "💬"}
  };

  const selecteur = new StringSelectMenuBuilder()
    .setCustomId(`aide_${interaction.user.id}`)
    .setPlaceholder("Catégorie")
    .addOptions(
      new selectMenuOption("Accueil", "Accueil", {
        emoji: cats.Accueil!.emoji,
        default: true,
      })
    );

  const categorie = fs.readdirSync("./dist/commands", { encoding: "utf-8" });
  for (const folderName of categorie)
    selecteur.addOptions(
      new selectMenuOption(folderName, folderName, {
        emoji: cats[folderName]!.emoji,
      })
    );

  const container = new Container("normal")
    .addText(`## :house: - Accueil`)
    .addSeparator("Large")
    .addText(
      `### Hey ${interaction.user} :wave:\n\n>>> Voici mon menu d'aide ! Séléctionne une des catégories dans le sélécteurs ci-dessous pour voir les commandes qui y correspondent.`
    )
    .addSeparator("Large")
    .addSelectMenu(selecteur);

  const msg = await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
    withResponse: true,
  });

  setTimeout(async () => {
    const actual_embed = msg.resource!.message;
    const new_embed = new ContainerBuilder(
      actual_embed!.components[0]!.toJSON() as APIContainerComponent
    );
    new_embed.components.forEach((element) => {
      if (element.data.type === 9)
        ((element as SectionBuilder).accessory as ButtonBuilder).data.disabled =
          true;
      if (element.data.type === 1)
        (
          element as ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>
        ).components.forEach((element) => (element.data.disabled = true));
    });

    await interaction.editReply({
      components: [new_embed],
      flags: MessageFlags.IsComponentsV2,
    });
  }, config.interaction_time);
};
