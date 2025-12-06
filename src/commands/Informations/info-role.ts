import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  EmbedBuilder,
  Role,
  PermissionsBitField,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };

export const name = "info-role";
export const description = "Donne des informations sur un rôle.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .addRoleOption((o) =>
    o
      .setName("role")
      .setDescription("Le rôle dont vous souhaitez avoir les informations.")
      .setRequired(true)
  );

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const permissions = {
    Administrator: "Administrateur",
    ViewAuditLog: "Voir les logs du serveur",
    ViewGuildInsights: "Voir le vue d'ensemble",
    ManageGuild: "Gérer le serveur",
    ManageRoles: "Gérer les rôles",
    ManageChannels: "Gérer les canaux",
    KickMembers: "Kick des membres",
    BanMembers: "Ban des membres",
    CreateInstantInvite: "Créer des invitations",
    ChangeNickname: "Change Nickname",
    ManageNicknames: "Gérer les pseudos",
    ManageEmojisAndStickers: "Gérer les émojis",
    ManageWebhooks: "Gérer les Webhooks",
    ViewChannel: "Lire les salons de texte et voir les salons vocaux",
    SendMessages: "Envoyer des messages",
    SendTTSMessages: "Envoyer des messages TTS",
    ManageMessages: "Gérer les messages",
    EmbedLinks: "Embed Links",
    AttachFiles: "Joindre des fichiers ",
    ReadMessageHistory: "Lire l'historique des messages",
    MentionEveryone: "Mentionner @everyone, @here, et tous les rôles",
    UseExternalEmojis: "Utiliser des émojis externes",
    AddReactions: "Ajouter des réactions",
    Connect: "Connecter",
    Speak: "Parler",
    Stream: "Vidéo",
    MuteMembers: "Mute des membres",
    DeafenMembers: "Rendre sourd les membres",
    MoveMembers: "Déplacer les membres",
    UseVAD: "Utiliser l'activité vocale",
    PrioritySpeaker: "Haut-parleur prioritaire",
    SendPolls: "Envoyer des sondages",
    ManageGuildExpressions: "Gérer les emojis, stickers et soundboards",
    UseApplicationCommands: "Utiliser les commandes slash",
    RequestToSpeak: "Demander à parler",
    ManageEvents: "Gérer les événements",
    ManageThreads: "Gérer les fils",
    CreatePublicThreads: "Créer un fil public",
    CreatePrivateThreads: "Créer un fil privé",
    UseExternalStickers: "Utiliser des stickers externes",
    SendMessagesInThreads: "Envoyer des messages dans les fils",
    UseEmbeddedActivities: "Utiliser les activités en vocal",
    ModerateMembers: "Rendre muet des membres",
    ViewCreatorMonetizationAnalytics: "",
    UseSoundboard: "Utiliser les soundboard",
    CreateGuildExpressions: "Créer des emojis, stickers et soundboards",
    CreateEvents: "Créer des événements",
    UseExternalSounds: "Utiliser des soundboards externes",
    SendVoiceMessages: "Envoyer des messages vocaux",
    UseExternalApps: "Utiliser des applications externes",
    PinMessages: "Épingler des messages",
    BypassSlowmode: "Ignorer le mode lent",
  };
  const role = interaction.options.getRole("role", true);
  if (role instanceof Role) {
    const embed = new EmbedBuilder()
      .setColor(
        role.colors.primaryColor !== 0
          ? role.colors.primaryColor
          : config.embed.normal
      )
      .setThumbnail(role.iconURL())
      .addFields({
        name: "ℹ️ - Informations",
        value: `>>> **ID** : ${role.id}\n**Nom** : ${role} \`${
          role.name
        }\`\n**Créé** <t:${Math.floor(
          role.createdTimestamp / 1000
        )}:R> (<t:${Math.floor(
          role.createdTimestamp / 1000
        )}:F>)\n**Position** : ${role.position}\n**Couleur** : ${
          role.colors.primaryColor === 0
            ? config.emojis.error
            : role.colors.primaryColor
        }\n\n**Séparé** : ${
          role.hoist ? config.emojis.success : config.emojis.error
        }\n**Mentionnable** : ${
          role.mentionable ? config.emojis.success : config.emojis.error
        }`,
      })
      .addFields({
        name: "🔧 - Avancé",
        value: `>>> **Membres possédant ce rôle** : ${
          role.members.size
        }\n**Bot** : ${
          role.tags?.botId ? config.emojis.success : config.emojis.error
        }\n**Intégration** : ${
          role.tags?.integrationId ? config.emojis.success : config.emojis.error
        }\n**Connexion** : ${
          role.tags?.guildConnections
            ? config.emojis.success
            : config.emojis.error
        }\n**Booster** : ${
          role.tags?.premiumSubscriberRole
            ? config.emojis.success
            : config.emojis.error
        }`,
      });
    if (role.permissions.bitfield !== BigInt(0))
      embed.addFields({
        name: "👤 - Permissions",
        value: `>>> - ${role.permissions
          .toArray()
          .map((r) => permissions[r])
          .slice(0, 30)
          .join("\n - ")}${
          role.permissions.toArray().length > 30
            ? `\n - Et ${role.permissions.toArray().length - 30} autres...`
            : ""
        }`,
      });
    return await interaction.reply({
      embeds: [embed],
    });
  }

  const embed = new EmbedBuilder()
    .setColor(
      role.colors && role.colors?.primary_color !== 0
        ? role.colors.primary_color
        : config.embed.normal
    )
    .setThumbnail(
      role.icon
        ? `https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}`
        : null
    )
    .addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${role.id}\n**Nom** : ${role.name} \`${
        role.name
      }\`\n**Position** : ${role.position}\n**Couleur** : ${
        role.colors ? role.colors.primary_color : "0"
      }\n\n**Séparé** : ${
        role.hoist ? config.emojis.success : config.emojis.error
      }\n**Mentionnable** : ${
        role.mentionable ? config.emojis.success : config.emojis.error
      }`,
    });

  if (role.permissions !== "0")
    embed.addFields({
      name: "👤 - Permissions",
      value: `>>> - ${new PermissionsBitField(BigInt(role.permissions))
        .toArray()
        .map((r) => permissions[r])
        .slice(0, 30)
        .join("\n - ")}${
        new PermissionsBitField(BigInt(role.permissions)).toArray().length > 30
          ? `\n - Et ${
              new PermissionsBitField(BigInt(role.permissions)).toArray()
                .length - 30
            } autres...`
          : ""
      }`,
    });
  await interaction.reply({
    embeds: [embed],
  });
};
