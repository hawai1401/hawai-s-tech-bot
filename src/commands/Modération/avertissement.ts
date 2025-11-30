import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  ContainerBuilder,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type APIContainerComponent,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" }
import { getDb } from "../../db/mongo.js";
import warn from "../../functions/warn.js";
import Container from "../../class/container.js";
import Button from "../../class/button.js";

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
      .setDescription("Supprimer un avertissement d'un membre")
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
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const msg = await interaction.deferReply();
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
      const actual_warns = await db.find({
        user: user.id,
        guild: interaction.guildId,
      });
      if (actual_warns.length === 25)
        return erreur(
          "Cet utilisateur a atteint la limite de 25 avertissements, merci d'en supprimer un avant d'en rajouter un nouveau !",
          interaction,
          { isDefered: true }
        );
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
  } else {
    const avertissements = await db.find({
      user: user.id,
      guild: interaction.guildId,
    });
    if (avertissements.length === 0)
      return warn("Cet utilisateur n'as pas d'avertissement !", interaction, {
        isDefered: true,
      });
    const container = new Container("normal")
      .addText(`## Liste des avertissements de ${user}`)
      .addSeparator("Large");
    for (const a of avertissements.slice(0, 3))
      container
        .addText(
          `### Avertissement n°${
            avertissements.findIndex((av) => av === a) + 1
          }\n>>> **Date** : <t:${a.created_at / 1000}:F> \n**Raison** : ${
            a.raison
          }\n**Autheur** : <@${a.author}>`
        )
        .addSeparator("Small");
    container.pop();
    if (avertissements.length > 3)
      container
        .addSeparator("Large")
        .addButtons(
          new Button(
            "bleu",
            { emoji: config.emojis.arrow_left },
            `avertissementPage_${interaction.user.id}_${user.id}_left_1`
          ).setDisabled(),
          new Button(
            "gris",
            { text: `1/${Math.ceil(avertissements.length / 3)}` },
            `avertissementPage_${interaction.user.id}_middle`
          ).setDisabled(),
          new Button(
            "bleu",
            { emoji: config.emojis.arrow_right },
            `avertissementPage_${interaction.user.id}_${user.id}_right_1`
          )
        );

    interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    setTimeout(async () => {
      const actual_embed = await msg.fetch();
      const new_embed = new ContainerBuilder(
        actual_embed!.components[0]!.toJSON() as APIContainerComponent
      );
      new_embed.components.forEach((element) => {
        if (element.data.type === 1)
          (element as ActionRowBuilder<Button>).components.forEach(
            (element) => (element.data.disabled = true)
          );
      });

      await interaction.editReply({
        components: [new_embed],
        flags: MessageFlags.IsComponentsV2,
      });
    }, config.interaction_time);
  }
};
