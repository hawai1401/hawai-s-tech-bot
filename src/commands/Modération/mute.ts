import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import ms, { type StringValue } from "ms";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import Button from "../../class/button.js";
import config from "../../../config.json" with { type: "json" }

export const name = "mute";
export const description = "Rendre un utilisateur temporairement muet.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur à rendre muet.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("durée")
      .setDescription(
        "La durée (ex : 1s, 1m, 1h, 1d, 1w) pour laquelle vous voulez rendre l'utilisateur muet."
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription(
        "La raison pour laquelle vous voulez rendre l'utilisateur muet."
      )
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const interaction_user = await interaction.guild!.members.fetch(
    interaction.user.id
  );
  const user = await interaction.guild!.members.fetch(
    interaction.options.getUser("utilisateur", true).id
  );
  const duree = interaction.options.getString("durée", true);
  const raison =
    interaction.options.getString("raison") || "Aucune raison fournie";

  // Utilisateur dans le serveur ?
  try {
    await interaction.guild!.members.fetch(user.id);
  } catch {
    return erreur(
      "Vous ne pouvez pas rendre muet un utilisateur qui ne se trouve pas sur le serveur !",
      interaction
    );
  }

  // Utilisateur veut se mute lui-même
  if (interaction.user.id === user.id)
    return erreur(
      "Vous ne pouvez pas vous rendre muet :stuck_out_tongue:",
      interaction
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreur(
      "Il en faudra plus pour me faire taire :stuck_out_tongue:",
      interaction
    );

  // Utilisateur est au-dessus de la personne à mute ?
  const member_highthest_role = interaction_user.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
      (member_highthest_role <= user_highthest_role &&
        interaction_user.id !== interaction.guild!.ownerId) ||
      user.id === interaction.guild!.ownerId
    )
    return erreur(
      "Vous ne pouvez pas rendre muet un utilisateur qui supérieur ou égal à vous !",
      interaction
    );

  // Bot peut mute la personne ?
  if (!interaction.appPermissions.has("ModerateMembers"))
    return erreur(
      "Je n'ai pas la permission de rendre muet un membre !",
      interaction
    );

  if (
    interaction.guild!.members.me!.roles.highest.position <= user_highthest_role
  )
    return erreur(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez rendre muet !",
      interaction
    );

  // Utilisateur admin ?
  if (user.permissions.has("Administrator"))
    return erreur(
      "Je n'ai pas la permission de rendre muet ce membre car il a la permission administrateur !",
      interaction
    );

  // Durée valide ?
  try {
    const duree_ms = ms(duree as StringValue);
    if (!duree_ms) throw new Error("Durée invalide");

    if (duree_ms > 2419200000) throw new Error("Durée trop longue");
  } catch (e) {
    return erreur(
      "La durée entrée est invalide !\n\n>>> `1 semaine` <:arrow_righ:1411387131401867416> `1w`\n`1 jour` <:arrow_righ:1411387131401867416> `1d`\n`1 heure` <:arrow_righ:1411387131401867416> `1h`\n`1 minute` <:arrow_righ:1411387131401867416> `1m`",
      interaction
    );
  }

  // Utilisateur déjà mute ?
  if (
    user.communicationDisabledUntilTimestamp &&
    user.communicationDisabledUntilTimestamp > Date.now()
  ) {
    const ancienne_duree = Math.floor(
      user.communicationDisabledUntilTimestamp / 1000
    );
    const nouvelle_duree =
      Math.floor(Date.now() / 1000) +
      Math.floor(ms(duree as StringValue) / 1000);

    const btn = new Button(
      "gris",
      { emoji: "📝", text: "Modifier la durée" },
      `editMute_${interaction.user.id}_${user.id}_${
        Date.now() + ms(duree as StringValue)
      }_${raison}`
    );
    const row = new ActionRowBuilder<Button>().addComponents(btn);

    const embed = new EmbedBuilder()
      .setTitle("<:attention:1408491864906141807> - Déjà muet")
      .setDescription(
        `${user} est déjà muet mais vous venez d'entrer une durée différente, voulez-vous la modifier ?`
      )
      .setFields(
        {
          name: ":outbox_tray: - Ancienne fin",
          value: `> <t:${ancienne_duree}:F> (<t:${ancienne_duree}:R>)`,
        },
        {
          name: ":inbox_tray: - Nouvelle fin",
          value: `> <t:${nouvelle_duree}:F> (<t:${nouvelle_duree}:R>)`,
        }
      )
      .setColor(config.embed.warn)
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    return setTimeout(async () => {
      btn.setDisabled();
      try {
        await interaction.editReply({ embeds: [embed], components: [row] });
      } catch {}
    }, config.interaction_time);
  }

  const duree_ms = ms(duree as StringValue);
  const fin_mute = new Date(Date.now() + duree_ms);

  const raison_mute = `@${interaction.user.tag} (${
    interaction.user.id
  }) : ${raison} | Il retrouvera la voix le ${fin_mute.toLocaleDateString()} à ${fin_mute.toLocaleTimeString()}`;

  await user.timeout(duree_ms, raison_mute);

  const embed = new EmbedBuilder()
    .setDescription(
      `### ${config.emojis.success} - ${user} a bien été rendu muet !`
    )
    .setFields(
      {
        name: ":outbox_tray: - Fin",
        value: `\`\`\`${fin_mute.toLocaleString()}\`\`\``,
      },
      {
        name: ":stopwatch: - Durée",
        value: `\`\`\`${ms(duree_ms, { long: true })}\`\`\``,
      },
      { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
    )
    .setImage("https://c.tenor.com/OJ__uqV8iIsAAAAd/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.warn} - Muet`)
    .setDescription(`> Vous venez d'être rendu muet !`)
    .setFields(
      {
        name: ":satellite: - Serveur",
        value: `\`\`\`${interaction.guild!.name}\`\`\``,
      },
      {
        name: ":outbox_tray: - Fin",
        value: `\`\`\`${new Date(
          Date.now() + duree_ms
        ).toLocaleString()}\`\`\``,
      },
      {
        name: ":stopwatch: - Durée",
        value: `\`\`\`${ms(duree_ms, { long: true })}\`\`\``,
      },
      { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
    )
    .setColor(config.embed.warn)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await client.users.send(user.id, { embeds: [embed_DM] });
  } catch {}
};
