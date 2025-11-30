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

export const name = "bannière";
export const description =
  "Afficher votre bannière ou celle d'un autre utilisateur.";

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
      .setDescription("L'utilisateur dont vous souhaiter voir la bannière.")
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const user = await client.users.fetch(
    interaction.options.getUser("utilisateur")?.id ?? interaction.user.id,
    { force: true }
  );
  const banner = user.bannerURL({ size: 4096 });
  if (!banner)
    return erreur("Cet utilisateur ne possède pas de bannière !", interaction);

  interaction.reply({
    content: banner,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new Button("lien", { text: "Bannière" }, banner)
      ),
    ],
  });
};
