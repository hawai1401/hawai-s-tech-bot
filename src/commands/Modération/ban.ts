import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  InteractionContextType,
  PermissionsBitField,
  SlashCommandBuilder,
  User,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" }

export const name = "ban";
export const description = "Bannir un utilisateur.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur à bannir.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription(
        "La raison pour laquelle vous voulez bannir l'utilisateur."
      )
  )
  .addStringOption((o) =>
    o
      .setName("supprimer_message")
      .setDescription("La période sur laquelle les messages seront supprimés.")
      .setChoices([
        { name: "1 jour", value: "1" },
        { name: "2 jours", value: "2" },
        { name: "3 jours", value: "3" },
        { name: "4 jours", value: "4" },
        { name: "5 jours", value: "5" },
        { name: "6 jours", value: "6" },
        { name: "7 jours", value: "7" },
      ])
  )
  .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  await interaction.deferReply();
  const interaction_user = await interaction.guild!.members.fetch(
    interaction.user.id
  );
  let user: User | GuildMember = interaction.options.getUser(
    "utilisateur",
    true
  );
  try {
    user = await interaction.guild!.members.fetch(user.id);
  } catch {}
  const raison =
    interaction.options.getString("raison") || "Aucune raison fournie";

  // Utilisateur veut se ban lui-même
  if (interaction.user.id === user.id)
    return erreur(
      "Vous ne pouvez pas vous bannir vous même :stuck_out_tongue:",
      interaction,
      { isDefered: true }
    );

  // Utilisateur veut ban le bot
  if (user.id === client.user.id)
    return erreur(
      "Il en faudra plus pour me faire disparaître :stuck_out_tongue:",
      interaction,
      { isDefered: true }
    );

  // Utilisateur est au-dessus de la personne à ban ?
  if (user instanceof GuildMember) {
    const member_highthest_role = interaction_user.roles.highest.position;
    const user_highthest_role = user.roles.highest.position;
    if (
      member_highthest_role <= user_highthest_role ||
      interaction_user.id !== interaction.guild!.ownerId
    )
      return erreur(
        "Vous ne pouvez pas bannir un utilisateur qui supérieur ou égal à vous !",
        interaction,
        { isDefered: true }
      );

    if (
      interaction.guild!.members.me!.roles.highest.position <=
      user_highthest_role
    )
      return erreur(
        "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez bannir !",
        interaction,
        { isDefered: true }
      );
  }

  // Bot peut ban la personne ?
  if (!interaction.appPermissions.has("BanMembers"))
    return erreur(
      "Je n'ai pas la permission de bannir un membre !",
      interaction,
      { isDefered: true }
    );

  // Utilisateur déjà ban ?
  try {
    const ban = await interaction.guild!.bans.fetch(user.id);
    return await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("<:attention:1408491864906141807> - Déjà banni")
          .setDescription(`${user} (${user.id}) est déjà banni !`)
          .setFields({
            name: ":pencil: - Raison",
            value: `\`\`\`${ban.reason || "Aucun raison fournie"}\`\`\``,
          })
          .setColor(config.embed.warn)
          .setFooter({
            text: `Demandé par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });
  } catch {}

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Banni`)
          .setDescription(`> Vous venez d'être banni !`)
          .setFields(
            {
              name: ":satellite: - Serveur",
              value: `\`\`\`${interaction.guild!.name}\`\`\``,
            },
            { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
          )
          .setColor(config.embed.warn)
          .setFooter({
            text: `Demandé par ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp(),
      ],
    });
  } catch {}

  await interaction.guild!.bans.create(user.id, {
    reason: `@${interaction.user.tag} (${interaction.user.id}) : ${raison}`,
    deleteMessageSeconds: isNaN(
      Number(interaction.options.getString("supprimer_message"))
    )
      ? 0
      : Number(interaction.options.getString("supprimer_message")) *
        24 *
        60 *
        60,
  });

  const embed = new EmbedBuilder()
    .setDescription(`### ${config.emojis.success} - ${user} a bien été banni !`)
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/zJe691uJBtYAAAAd/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};
