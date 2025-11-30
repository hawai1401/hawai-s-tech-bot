import {
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  type ComponentEmojiResolvable,
} from "discord.js";
import type { botClient } from "../../index.js";
import selectMenuOption from "../../class/selectMenuOption.js";
import fs from "fs";
import Container from "../../class/container.js";

export const type = "interactionCreate";

export const event = async (
  client: botClient,
  interaction: StringSelectMenuInteraction
) => {
  const value = interaction.values[0]!;

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
    .setCustomId(`aidePrefix_${interaction.user.id}`)
    .setPlaceholder("Catégorie")
    .addOptions(
      new selectMenuOption("Accueil", "Accueil", {
        emoji: cats.Accueil!.emoji,
      })
    );

  const categorie = fs.readdirSync("./dist/prefix commands", { encoding: "utf-8" });
  for (const folderName of categorie)
    selecteur.addOptions(
      new selectMenuOption(folderName, folderName, {
        emoji: cats[folderName]!.emoji,
        default: folderName === value,
      })
    );

  const container = new Container("normal")
    .addText(`## ${cats[value]!.emoji} - ${value}`)
    .addSeparator("Large");

  if (value === "Accueil") {
    selecteur.options[0]!.setDefault(true);
    container
      .addText(
        `### Hey ${interaction.user} :wave:\n\n>>> Voici mon menu d'aide ! Séléctionne une des catégories dans le sélécteurs ci-dessous pour voir les commandes qui y correspondent.`
      )
      .addSeparator("Large")
      .addSelectMenu(selecteur);

    return interaction.update({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  const cat = fs.readdirSync(`./dist/prefix commands/${value}`, {
    encoding: "utf-8",
  });

  for (const commande of cat) {
    const cmd = client.prefixCommands.findKey(
      (_, k) => k.name === commande.slice(0, commande.length - 3)
    );
    if (!cmd) continue;
    let options = "";

    cmd.options?.forEach((option) => {
      return (options += `> - **${option.name}**\n>   - __Description__ : ${
        option.description
      }\n>   - __Obligatoire__ : ${
        option.required
          ? "<:coche:1408551329026146334>"
          : "<:croix:1408551342821212230>"
      }\n`);
    });

    container
      .addText(
        `### ${cmd.name}\n- **Alias** : ${
          cmd.alias.length > 0
            ? `\n${cmd.alias.map((a) => `> - ${a}`).join("\n")}`
            : "Aucun"
        }\n- **Description :**\n> ${cmd.description}${
          options ? `\n- **Options :**\n${options}` : ""
        }`
      )
      .addSeparator("Small");
  }

  container.pop().addSeparator("Large").addSelectMenu(selecteur);

  interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};
