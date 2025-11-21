import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import erreur from "../../functions/error.js";
import config from "../../../config.json" with { type: "json" }

export const name = "expulser";
export const description = "Expulser un membre.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur à expulser.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription(
        "La raison pour laquelle vous voulez expulser l'utilisateur."
      )
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

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
  const raison =
    interaction.options.getString("raison") || "Aucune raison fournie";

  // Utilisateur dans le serveur ?
  try {
    await interaction.guild!.members.fetch(user.id);
  } catch {
    return erreur(
      "Vous ne pouvez pas expulser un utilisateur qui ne se trouve pas sur le serveur !",
      interaction
    );
  }

  // Utilisateur veut se mute lui-même
  if (interaction.user.id === user.id)
    return erreur(
      "Vous ne pouvez pas vous expulser :stuck_out_tongue:",
      interaction
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreur(
      "Il en faudra plus pour me faire disparaître :stuck_out_tongue:",
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
      "Vous ne pouvez pas expulser un utilisateur qui supérieur ou égal à vous !",
      interaction
    );

  // Bot peut mute la personne ?
  if (!interaction.appPermissions.has("KickMembers"))
    return erreur(
      "Je n'ai pas la permission d'expulser un membre !",
      interaction
    );

  if (
    interaction.guild!.members.me!.roles.highest.position <= user_highthest_role
  )
    return erreur(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez expulser !",
      interaction
    );

  const raison_kick = `@${interaction.user.tag} (${interaction.user.id}) : ${raison}`;

  try {
    await client.users.send(user.id, {
      embeds: [
        new EmbedBuilder()
          .setTitle(`${config.emojis.warn} - Expulsé`)
          .setDescription(`> Vous venez d'être expulsé !`)
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

  await user.kick(raison_kick);

  const embed = new EmbedBuilder()
    .setDescription(
      `### ${config.emojis.success} - ${user} a bien été expulsé !`
    )
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/Qu0EBPEe748AAAAd/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};
