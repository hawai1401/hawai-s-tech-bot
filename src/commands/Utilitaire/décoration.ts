import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import Button from "../../class/button.js";

export const name = "décoration";
export const description =
  "Afficher votre décoration ou celle d'un autre utilisateur.";

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
  .addUserOption((o) =>
    o
      .setName("utilisateur")
      .setDescription("L'utilisateur dont vous souhaiter voir la décoration.")
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const user = await client.users.fetch(
    interaction.options.getUser("utilisateur")?.id ?? interaction.user.id,
    { force: true }
  );
  const decoration = user.avatarDecorationURL({ size: 4096 });
  if (!decoration)
    return erreur(
      "Cet utilisateur ne possède pas de décoration d'avatar !",
      interaction
    );

  interaction.reply({
    content: decoration,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new Button("lien", { text: "Décoration" }, decoration)
      ),
    ],
  });
};
