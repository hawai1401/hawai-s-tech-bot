import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" }
import { getDb } from "../../db/mongo.js";

export const name = "avertissement";
export const description = "Gérer les avertissements.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addSubcommand((sub) =>
    sub
      .setName("ajouter")
      .setDescription("Avertir un membre.")
      .addUserOption((o) =>
        o
          .setName("membre")
          .setDescription("Le membre à avertir.")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("raison")
          .setDescription("La raison de l'avertissement")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("lister")
      .setDescription("Lister les avertissements d'un membre.")
      .addUserOption((o) =>
        o
          .setName("membre")
          .setDescription(
            "Le membre dont vous souhaitez lister les avertissements."
          )
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("retirer")
      .setDescription("Supprimer l'avertissement d'un membre")
      .addUserOption((o) =>
        o
          .setName("membre")
          .setDescription("Le membre dont l'avertissement sera retiré.")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("avertissement")
          .setDescription("L'avertissement à retirer.")
          .setRequired(true)
          .setAutocomplete(true)
      )
  )
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();
  const interaction_user = await interaction.guild!.members.fetch(
    interaction.user.id
  );
  const user = await interaction.guild!.members.fetch(
    interaction.options.getUser("membre", true).id
  );
  const sub = interaction.options.getSubcommand() as
    | "ajouter"
    | "lister"
    | "retirer";
  const db = getDb().Warns;

  if (sub === "ajouter" || sub === "retirer") {
    try {
      await interaction.guild!.members.fetch(user.id);
    } catch {
      return erreur(
        `Vous ne pouvez pas ${sub} un avertissement à un utilisateur qui ne se trouve pas sur le serveur !`,
        interaction,
        { isDefered: true }
      );
    }

    if (interaction.user.id === user.id)
      return erreur(
        `Vous ne pouvez pas vous ${sub} un avertissement :stuck_out_tongue:`,
        interaction,
        { isDefered: true }
      );

    if (user.id === client.user.id)
      return erreur("Je suis trop parfait pour ça :sunglasses:", interaction, {
        isDefered: true,
      });

    const member_highthest_role = interaction_user.roles.highest.position;
    const user_highthest_role = user.roles.highest.position;
    if (
      (member_highthest_role <= user_highthest_role &&
        interaction_user.id !== interaction.guild!.ownerId) ||
      user.id === interaction.guild!.ownerId
    )
      return erreur(
        `Vous ne pouvez pas ${sub} un avertissement à un utilisateur qui supérieur ou égal à vous !`,
        interaction,
        { isDefered: true }
      );

    const getEmbed = (text: string, raison: string) =>
      new EmbedBuilder()
        .setDescription(`### ${config.emojis.success} - ${text}`)
        .setFields({
          name: ":pencil: - Raison",
          value: `\`\`\`${raison}\`\`\``,
        })
        .setColor(config.embed.success)
        .setFooter({
          text: `Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

    let raison: string;

    if (sub === "ajouter") {
      raison = interaction.options.getString("raison", true);
      await db.insertOne({
        guild: interaction.guildId!,
        author: interaction_user.id,
        user: user.id,
        raison,
      });

      await interaction.editReply({
        embeds: [getEmbed(`${user} a été averti avec succès !`, raison)],
      });
    } else {
      if (
        interaction.options.getString("avertissement", true).split(";")[0] ===
        "null"
      )
        return erreur(
          interaction.options.getString("avertissement", true).split(";")[1]!,
          interaction,
          { isDefered: true }
        );
      const db_warn = await db.findByIdAndDelete({
        _id: interaction.options.getString("avertissement", true),
      });
      if (!db_warn)
        return erreur(
          "Avertissement invalide, merci d'en choisir un dans la liste !",
          interaction,
          { isDefered: true }
        );
      raison = db_warn.raison;
      await interaction.editReply({
        embeds: [
          getEmbed(`L'avertissement a été supprimé avec succès !`, raison),
        ],
      });
    }

    const embed_DM = new EmbedBuilder()
      .setTitle(`${config.emojis.warn} - Avertissement`)
      .setDescription(
        `> ${
          sub === "ajouter"
            ? "Vous venez d'être averti !"
            : "Un avertissement vient de vous être retiré !"
        }`
      )
      .setFields(
        {
          name: ":satellite: - Serveur",
          value: `\`\`\`${interaction.guild!.name}\`\`\``,
        },
        { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
      )
      .setColor(sub === "ajouter" ? config.embed.warn : config.embed.success)
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    try {
      await client.users.send(user.id, { embeds: [embed_DM] });
    } catch {}
  }
};
