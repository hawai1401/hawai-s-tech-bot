import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  EmbedBuilder,
  SectionBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  type APIContainerComponent,
  ContainerBuilder,
} from "discord.js";
import ms, { type StringValue } from "ms";
import { getDb } from "../../db/mongo.js";
import config from "../../../config.json" with { type: "json" };
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import Container from "../../class/container.js";
import Button from "../../class/button.js";
import success from "../../functions/success.js";

export const name = "rappel";
export const description = "Gérer les rappels.";

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
  .addSubcommand((sub) =>
    sub
      .setName("créer")
      .setDescription("Créer un nouveau rappel.")
      .addStringOption((o) =>
        o
          .setName("message")
          .setDescription("Le message du rappel qui vous sera envoyé.")
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName("temps")
          .setDescription("Dans combien de temps le rappel doit être envoyé ?")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName("lister").setDescription("Lister vos rappels.")
  )
  .addSubcommand((sub) =>
    sub
      .setName("supprimer")
      .setDescription("Supprimer un rappel.")
      .addStringOption((o) =>
        o
          .setName("rappel")
          .setDescription("Le rappel à supprimer.")
          .setAutocomplete(true)
          .setRequired(true)
      )
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction,
) => {
  const sub = interaction.options.getSubcommand(true) as
    | "créer"
    | "lister"
    | "supprimer";
  const db = getDb().Rappels;
  const msg = await interaction.deferReply();

  if (sub === "créer") {
    const message = interaction.options.getString("message", true);
    const temps = interaction.options.getString("temps", true) as StringValue;

    try {
      const temps_ms = ms(temps);
      if (!temps_ms) throw new Error("Durée invalide");
    } catch {
      return erreur(
        `La durée entrée est invalide !\n\n>>> \`1 semaine\` ${config.emojis.arrow_right} \`1w\`\n\`1 jour\` ${config.emojis.arrow_right} \`1d\`\n\`1 heure\` ${config.emojis.arrow_right} \`1h\`\n\`1 minute\` ${config.emojis.arrow_right} \`1m\``,
        interaction,
        { notEphemeral: true }
      );
    }

    const temps_s = Math.floor((Date.now() + ms(temps)) / 1000);

    const nbr_rappels = await db
      .find({
        user: interaction.user.id,
      })

    if (nbr_rappels.length === 25)
      return erreur(
        "Vous avez atteint la limite de 25 rappels ! Merci d'en supprimer un avant d'en rajouter un autre.",
        interaction
      );
    await db.insertOne({
      user: interaction.user.id,
      message,
      date: temps_s,
    });

    return await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setFields(
            { name: ":bookmark_tabs: - Contenu", value: `> ${message}` },
            {
              name: ":calendar_spiral: - Date",
              value: `> Le <t:${temps_s}:d> à <t:${temps_s}:t> (<t:${temps_s}:R>).`,
            }
          )
          .setFooter({
            text: `N'oubliez pas d'ouvrir vos MP !`,
            iconURL: client.user.displayAvatarURL() as string,
          })
          .setColor(config.embed.success)
          .setTimestamp(),
      ],
    });
  }

  if (sub === "lister") {
    const rappels = (await db
      .find({
        user: interaction.user.id,
      }));

    if (rappels.length === 0)
      return erreur("Vous n'avez pas de rappels !", interaction, {
        isDefered: true,
      });

    const container = new Container("normal")
      .addText("### 🔔 - Liste de vos rappels")
      .addSeparator("Large");

    for (const r of rappels.slice(0, 3))
      container
        .addSection(
          `**Contenu** : ${r.message}\n**Date** : <t:${r.date}:F> (<t:${r.date}:R>)`,
          new Button(
            "rouge",
            { emoji: "🗑️" },
            `rappelSupprimer_${interaction.user.id}_${r._id}_1`
          )
        )
        .addSeparator("Small");
    container.pop();

    if (rappels.length > 3)
      container
        .addSeparator("Large")
        .addButtons(
          new Button(
            "bleu",
            { emoji: config.emojis.arrow_left },
            `rappelPage_${interaction.user.id}_left_1`
          ).setDisabled(),
          new Button(
            "gris",
            { text: `1/${Math.ceil(rappels.length / 3)}` },
            `rappelPage_${interaction.user.id}_middle`
          ).setDisabled(),
          new Button(
            "bleu",
            { emoji: config.emojis.arrow_right },
            `rappelPage_${interaction.user.id}_right_1`
          )
        );

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  if (sub === "supprimer") {
    const rappel_id = interaction.options.getString("rappel", true);
    if (rappel_id === "null") return erreur("Vous n'avez aucun rappel !", interaction, {isDefered: true})
    const rappel = await db.findOneAndDelete({ _id: rappel_id });
    if (!rappel)
      return erreur(
        "Rappel invalide ! Merci de choisir un rappel dans la liste !",
        interaction,
        { isDefered: true }
      );
    return success("Rappel supprimer avec succès !", interaction, {
      isDefered: true,
    });
  }

  setTimeout(async () => {
    const actual_embed = await msg.fetch();
    const new_embed = new ContainerBuilder(
      actual_embed!.components[0]!.toJSON() as APIContainerComponent
    );
    new_embed.components.forEach((element) => {
      if (element.data.type === 9)
        ((element as SectionBuilder).accessory as ButtonBuilder).data.disabled =
          true;
      if (element.data.type === 1)
        (element as ActionRowBuilder<ButtonBuilder>).components.forEach(
          (element) => (element.data.disabled = true)
        );
    });

    await interaction.editReply({
      components: [new_embed],
      flags: MessageFlags.IsComponentsV2,
    });
  }, config.interaction_time);
};
