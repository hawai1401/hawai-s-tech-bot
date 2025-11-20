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

export const name = "unban";
export const description = "Débannir un utilisateur.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur à débannir.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription(
        "La raison pour laquelle vous voulez débannir l'utilisateur."
      )
  )

  .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers);

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
    return erreur("Vous n'êtes pas banni :stuck_out_tongue:", interaction, {
      isDefered: true,
    });

  // Utilisateur veut ban le bot
  if (user.id === client.user.id)
    return erreur("Je suis déjà là :stuck_out_tongue:", interaction, {
      isDefered: true,
    });

  // Utilisateur est au-dessus de la personne à ban ?
  if (user instanceof GuildMember) {
    const member_highthest_role = interaction_user.roles.highest.position;
    const user_highthest_role = user.roles.highest.position;
    if (
      member_highthest_role <= user_highthest_role ||
      interaction_user.id !== interaction.guild!.ownerId
    )
      return erreur(
        "Vous ne pouvez pas débannir un utilisateur qui supérieur ou égal à vous !",
        interaction,
        { isDefered: true }
      );

    if (
      interaction.guild!.members.me!.roles.highest.position <=
      user_highthest_role
    )
      return erreur(
        "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez débannir !",
        interaction,
        { isDefered: true }
      );
  }

  // Bot peut ban la personne ?
  if (!interaction.appPermissions.has("BanMembers"))
    return erreur(
      "Je n'ai pas la permission de dédébannir un membre !",
      interaction,
      { isDefered: true }
    );

  // Utilisateur déjà ban ?
  try {
    await interaction.guild!.bans.fetch(user.id);
  } catch {
    return erreur(`${user} (${user.id}) n'est pas banni !`, interaction, {
      isDefered: true,
    });
  }

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Débanni`)
          .setDescription(`> Vous venez d'être débanni !`)
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

  await interaction.guild!.bans.remove(
    user.id,
    `@${interaction.user.tag} (${interaction.user.id}) : ${raison}`
  );

  const embed = new EmbedBuilder()
    .setDescription(
      `### ${config.emojis.success} - ${user} a bien été débanni !`
    )
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/FjUd6NvVRnMAAAAC/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
};
