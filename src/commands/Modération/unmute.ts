import {
  ActionRowBuilder,
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
import warn from "../../functions/warn.js";

export const name = "unmute";
export const description = "Rendre la voix à un utilisateur muet.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("L'utilisateur auquel rendre la voix.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription(
        "La raison pour laquelle vous voulez rendre la voix à l'utilisateur muet."
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
  const raison =
    interaction.options.getString("raison") || "Aucune raison fournie";

  // Utilisateur dans le serveur ?
  try {
    await interaction.guild!.members.fetch(user.id);
  } catch {
    return erreur(
      "Vous ne pouvez pas rendre la voix à un utilisateur qui ne se trouve pas sur le serveur !",
      interaction
    );
  }

  // Utilisateur veut se mute lui-même
  if (interaction.user.id === user.id)
    return erreur(
      "Vous n'êtes pas muet, vous venez de faire la commande :wink:",
      interaction
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreur("Je ne me tais jamais :stuck_out_tongue:", interaction);

  // Utilisateur est au-dessus de la personne à mute ?
  const member_highthest_role = interaction_user.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
    member_highthest_role <= user_highthest_role ||
    interaction_user.id !== interaction.guild!.ownerId
  )
    return erreur(
      "Vous ne pouvez pas rendre la voix à un utilisateur qui supérieur ou égal à vous !",
      interaction
    );

  // Bot peut mute la personne ?
  if (!interaction.appPermissions.has("ModerateMembers"))
    return erreur(
      "Je n'ai pas la permission de rendre la voix à un membre !",
      interaction
    );

  if (
    interaction.guild!.members.me!.roles.highest.position <= user_highthest_role
  )
    return erreur(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre auquel vous souhaitez rendre la voix muet !",
      interaction
    );

  // Utilisateur déjà mute ?
  if (
    !user.communicationDisabledUntilTimestamp ||
    user.communicationDisabledUntilTimestamp < Date.now()
  )
    return warn("Cet utilisateur n'est pas muet !", interaction);

  const raison_demute = `@${interaction.user.tag} (${interaction.user.id}) : ${raison}`;
  await user.disableCommunicationUntil(null, raison_demute);

  const embed = new EmbedBuilder()
    .setDescription(
      `### <:coche:1408551329026146334> - ${user} a retrouvé la voix !`
    )
    .setFields({ name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` })
    .setImage("https://c.tenor.com/FjUd6NvVRnMAAAAC/tenor.gif")
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.success} - Plus muet`)
    .setDescription(`> Vous pouvez de nouveau discuter !`)
    .setFields(
      {
        name: ":satellite: - Serveur",
        value: `\`\`\`${interaction.guild!.name}\`\`\``,
      },
      { name: ":pencil: - Raison", value: `\`\`\`${raison}\`\`\`` }
    )
    .setColor(config.embed.success)
    .setFooter({
      text: `Demandé par ${interaction.user.tag}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await client.users.send(user.id, { embeds: [embed_DM] });
  } catch {}
};
