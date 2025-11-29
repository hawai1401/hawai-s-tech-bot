import {
  MessageFlags,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import Container from "../../class/container.js";
import { eventSlash } from "../../logger.js";
import erreurMsg from "../../functions/errorMsg.js";

export const type = "messageCreate";

export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>
) => {
  if (
    !message.inGuild() ||
    !message.content.startsWith(config.prefix) ||
    message.content.split(" ")[0]!.slice(config.prefix.length) === "eval"
  )
    return;
  const cmd = client.prefixCommands.find(
    (_, k) =>
      k.name === message.content.split(" ")[0]!.slice(config.prefix.length) ||
      k.alias.includes(
        message.content.split(" ")[0]!.slice(config.prefix.length)
      )
  );
  if (!cmd) {
    const similar = client.prefixCommands.filter(
      (_, k) =>
        k.name.startsWith(
          message.content.split(" ")[0]!.slice(config.prefix.length)
        ) ||
        k.alias.find((a) =>
          a.startsWith(
            message.content.split(" ")[0]!.slice(config.prefix.length)
          )
        )
    );
    if (similar.size === 0)
      return await message.reply({
        components: [
          new Container("error").addText(
            `### ${config.emojis.error} - Aucune commande trouvée avec ce nom ou similaire à ce nom !`
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    return await message.reply({
      components: [
        new Container("error").addText(
          `### ${
            config.emojis.error
          } - Aucune commande trouvée avec ce nom !\n\nVoici des commandes similaires :\n>>> ${similar
            .map((_, k) => `- ${k.name}`)
            .join("\n")}`
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  const permissions: {
    [key: string]: string;
  } = {
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
    CreateGuildExpressions: "",
    CreateEvents: "Créer des événements",
    UseExternalSounds: "Utiliser des soundboards externes",
    SendVoiceMessages: "Envoyer des messages vocaux",
    UseExternalApps: "Utiliser des applications externes",
    PinMessages: "Épingler des messages",
    BypassSlowmode: "Ignorer le mode lent",
  };

  const permission = client.prefixCommands.findKey(
    (c) => c === cmd
  )!.permission;
  if (
    permission &&
    !(await message.guild!.members.fetch(message.author.id)).permissions.has(
      permission
    )
  )
    return erreurMsg(
      `Vous n'avez pas la permission d'effectuer cette commande !\n\n> **Permission manquante** : ${
        permissions[permission as string]
      }`,
      message
    );

  eventSlash(
    message.content.split(" ")[0]!.slice(config.prefix.length),
    message.author.tag,
    message.author.id,
    message.guild.name,
    message.guildId!
  );

  await cmd(client, message, message.content.split(" ").slice(1));
};
