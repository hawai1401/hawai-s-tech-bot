import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  InteractionContextType,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import success from "../../functions/success.js";

export const name = "reload-cmd";
export const description = "[ DEV ] Recharger une commande";

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
      .setName("cmd")
      .setDescription("La commande à recharger")
      .setRequired(true)
      .setAutocomplete(true)
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();
  const path = interaction.options.getString("cmd", true);
  const new_cmd = await import(`${path}?update=${Date.now()}`);
  client.commands.set(new_cmd.name, new_cmd.command);

  const rest = new REST({ version: "10" }).setToken(
    process.env.TOKEN_DEV as string
  );

  try {
    await rest.patch(
      Routes.applicationCommand(
        client.user.id,
        (
          await client.application!.commands.fetch()
        ).find((c) => c.name === new_cmd.name)!.id
      ),
      {
        body: new_cmd.cmd_builder.toJSON(),
      }
    );
  } catch (e) {
    await erreur(
      "Une erreur est survenue pour recharger cette commande !",
      interaction,
      { isDefered: true }
    );
    throw e;
  }

  await success("Commande rechargée avec succès !", interaction, {
    isDefered: true,
  });
};
