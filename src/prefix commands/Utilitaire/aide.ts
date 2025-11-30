import {
  ButtonBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
  type APIContainerComponent,
  type ComponentEmojiResolvable,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import fs from "fs";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import Container from "../../class/container.js";
import selectMenuOption from "../../class/selectMenuOption.js";

export const data: prefixCommand_data = {
  name: "aide",
  description: "Afficher la liste des commandes.",
  alias: ["help"],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
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
    Message: { emoji: "💬" },
  };

  const selecteur = new StringSelectMenuBuilder()
    .setCustomId(`aidePrefix_${message.author.id}`)
    .setPlaceholder("Catégorie")
    .addOptions(
      new selectMenuOption("Accueil", "Accueil", {
        emoji: cats.Accueil!.emoji,
        default: true,
      })
    );

  const categorie = fs.readdirSync("./dist/prefix commands", { encoding: "utf-8" });
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
      `### Hey ${message.author} :wave:\n\n>>> Voici mon menu d'aide ! Séléctionne une des catégories dans le sélécteurs ci-dessous pour voir les commandes qui y correspondent.`
    )
    .addSeparator("Large")
    .addSelectMenu(selecteur);

  const msg = await message.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  setTimeout(async () => {
    const new_embed = new ContainerBuilder(
      msg!.components[0]!.toJSON() as APIContainerComponent
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

    await msg.edit({
      components: [new_embed],
      flags: MessageFlags.IsComponentsV2,
    });
  }, config.interaction_time);
};
