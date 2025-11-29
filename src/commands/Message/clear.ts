import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import success from "../../functions/success.js";

export const name = "clear";
export const description =
  "Effacer des messages en masse datant de moins de 14 jours.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addIntegerOption((o) =>
    o
      .setName("nombre")
      .setDescription("Le nombre de message à supprimer.")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  if (!interaction.appPermissions.has("ManageMessages"))
    return erreur(
      "Je n'ai pas la permission de gérer les messages !",
      interaction
    );
  if (interaction.channel!.isDMBased())
    return erreur("Commande indisponible dans ce salon !", interaction);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const msg = await interaction.channel!.bulkDelete(
    interaction.options.getInteger("nombre", true),
    true
  );
  if (msg.size === 0)
    return erreur(
      "Aucun message n'a été supprimé !\nPeut-être qu'ils datent de plus de 14 jours.",
      interaction,
      { isDefered: true }
    );

  return success(
    `${msg.size} messages ont été supprimé avec succès !`,
    interaction,
    { isDefered: true }
  );
};
