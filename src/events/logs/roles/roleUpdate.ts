import {
  AuditLogEvent,
  EmbedBuilder,
  TextChannel,
  type Role,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "roleUpdate";

export const event = async (
  client: botClient,
  oldRole: Role,
  newRole: Role
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
    CreateGuildExpressions:
      "Créer des emojis, stickers et soundboardsCréer des emojis, stickers et soundboards",
    CreateEvents: "Créer des événements",
    UseExternalSounds: "Utiliser des soundboards externes",
    SendVoiceMessages: "Envoyer des messages vocaux",
    UseExternalApps: "Utiliser des applications externes",
    PinMessages: "Épingler des messages",
    BypassSlowmode: "Ignorer le mode lent",
  };

  const log = (
    await newRole.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleUpdate,
    })
  ).entries.first();
  const executor = log?.executor;
  if (!executor) return;

  const updated = [];
  const embed = new EmbedBuilder()
    .setColor(config.embed.warn)
    .setAuthor({
      name: executor.username!,
      iconURL: executor.displayAvatarURL(),
    })
    .setThumbnail(newRole.iconURL())
    .setFooter({
      text: "Rôle modifié",
      iconURL: newRole.guild.iconURL() ?? "",
    })
    .setTimestamp();

  if (oldRole.name !== newRole.name) {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newRole.id}\n**Nom** : ${newRole} \`${oldRole.name}\` ${config.emojis.arrow_right} \`${newRole.name}\``,
    });
  } else {
    embed.addFields({
      name: "ℹ️ - Informations",
      value: `>>> **ID** : ${newRole.id}\n**Nom** : ${newRole} \`${newRole.name}\``,
    });
  }

  if (
    oldRole.colors !== newRole.colors &&
    oldRole.colors.primaryColor !== newRole.colors.primaryColor
  )
    updated.push(
      `**Couleur** : \`${oldRole.colors.primaryColor}\` ${config.emojis.arrow_right} \`${newRole.colors.primaryColor}\``
    );
  if (oldRole.hoist !== newRole.hoist)
    updated.push(
      `**Séparé** : ${
        oldRole.hoist ? config.emojis.success : config.emojis.error
      } ${config.emojis.arrow_right} ${
        newRole.hoist ? config.emojis.success : config.emojis.error
      }`
    );
  if (oldRole.mentionable !== newRole.mentionable)
    updated.push(
      `**Mentionnable** : ${
        oldRole.mentionable ? config.emojis.success : config.emojis.error
      } ${config.emojis.arrow_right} ${
        newRole.mentionable ? config.emojis.success : config.emojis.error
      }`
    );
  if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
    const oldPerms = oldRole.permissions.toArray();
    const newPerms = newRole.permissions.toArray();
    const addedPerms = newPerms.filter((perm) => !oldPerms.includes(perm));
    const removedPerms = oldPerms.filter((perm) => !newPerms.includes(perm));
    if (addedPerms.length > 0)
      embed.addFields({
        name: `📥 - Permissions ajoutées`,
        value:
          ">>> " +
          addedPerms.map((perm) => `- \`${permissions[perm]}\``).join("\n"),
      });

    if (removedPerms.length > 0)
      embed.addFields({
        name: `📤 - Permissions supprimées`,
        value:
          ">>> " +
          removedPerms.map((perm) => `- \`${permissions[perm]}\``).join("\n"),
      });
  }

  if (oldRole.iconURL() !== newRole.iconURL())
    updated.push(`**Icône** : Modifiée`);

  if (
    updated.length === 0 &&
    embed.data.fields!.length === 1 &&
    oldRole.name === newRole.name
  )
    return;

  if (updated.length > 0)
    embed.addFields({
      name: "✏️ - Informations modifiées",
      value: ">>> " + updated.join("\n"),
    });

  const channel = (await client.channels.fetch(
    "1445843822146879590"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
