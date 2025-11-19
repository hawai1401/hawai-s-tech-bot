import { MessageFlags, type Interaction } from "discord.js";
import type { botClient } from "../../index.js";
import Container from "../../class/container.js";
import config from "../../../config.json" with { type: "json" };

export default async function buttonInteraction(
  client: botClient,
  interaction: Interaction
) {
  if (!interaction.isButton()) return;
  const user_id = interaction.customId.split("_")[1]!;
  if (user_id !== interaction.user.id)
    return interaction.reply({
      components: [
        new Container("error").addText(
          `### ${config.emojis.error} - Ceci n'est pas votre commande, merci de ne pas intéragir avec !`
        ),
      ],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
    });
  const interaction_name = interaction.customId.split("_")[0]!;
  try {
    const interaction_file = await import(`./${interaction_name}.js`);
    interaction_file.event(client, interaction);
  } catch {
    return interaction.reply({
      components: [
        new Container("error").addText(
          `### ${config.emojis.error} - Une erreur est survenue avec l'exécution de ce bouton !`
        ),
      ],
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
    });
  }
}
