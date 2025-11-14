import {
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  type APIApplicationCommandOption,
  type APIApplicationCommandOptionBase,
  type ApplicationCommandOption,
  type ComponentEmojiResolvable,
} from "discord.js";
import type { botClient } from "../../index.js";
import selectMenuOption from "../../class/selectMenuOption.js";
import fs from "fs";
import Container from "../../class/container.js";

export const type = "interactionCreate";

export const event = async (
  interaction: StringSelectMenuInteraction,
  client: botClient
) => {
  const value = interaction.values[0]!;

  const cats: Record<
    string,
    { emoji: ComponentEmojiResolvable; description: string }
  > = {
    Accueil: { emoji: "🏠", description: "Accueil du menu d'aide." },
    Développeur: {
      emoji: "1409160797346857112",
      description: "Commandes réservées au développeur du bot.",
    },
    Économie: { emoji: "🪙", description: "Soon..." },
    Informations: {
      emoji: "ℹ️",
      description: "Commandes qui permettent d'obtenir des informations.",
    },
    Modération: { emoji: "🛡️", description: "Commandes de modération." },
    Utilitaire: { emoji: "📡", description: "Commandes utilitaires." },
  };

  const selecteur = new StringSelectMenuBuilder()
    .setCustomId(`aide_${interaction.user.id}`)
    .setPlaceholder("Catégorie")
    .addOptions(
      new selectMenuOption("Accueil", "Accueil", {
        description: cats.Accueil!.description,
        emoji: cats.Accueil!.emoji,
      })
    );

  const categorie = fs.readdirSync("./dist/commands", { encoding: "utf-8" });
  for (const folderName of categorie)
    selecteur.addOptions(
      new selectMenuOption(folderName, folderName, {
        description: cats[folderName]!.description,
        emoji: cats[folderName]!.emoji,
        default: folderName === value,
      })
    );

  const container = new Container("normal")
    .addText(`## ${cats[value]!.emoji} - ${value}`)
    .addSeparator("Large")
    .addText(`>>> ${cats[value]!.description}`)
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

  const cat = fs.readdirSync(`./dist/commands/${value}`, {
    encoding: "utf-8",
  });

  const whitelist = ["pdp-decoration.js", "pdp", "banner-tag.js", "banner"];
  const commands = await client.application!.commands.fetch();
  for (const commande of cat) {
    if (whitelist.includes(commande)) continue;
    commands.forEach((cmd) => {
      if (cmd.name === commande.slice(0, commande.length - 3)) {
        let options = "";
        cmd.options.forEach(
          (option: APIApplicationCommandOptionBase<any>) =>
            (options += `> - **${option.name}**\n>   - __Description__ : ${
              option.description
            }\n>   - __Obligatoire__ : ${
              option.required
                ? "<:coche:1408551329026146334>"
                : "<:croix:1408551342821212230>"
            }\n`)
        );
        container
          .addText(
            `### </${cmd.name}:${cmd.id}>\n- **Description :**\n> ${
              cmd.description
            }${options ? `\n- **Options :**\n${options}` : ""}`
          )
          .addSeparator("Small");
      }
    });
  }

  container.pop().addSeparator("Large").addSelectMenu(selecteur);

  interaction.update({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};
