import {
  ActionRowBuilder,
  ApplicationIntegrationType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import type { botClient } from "../../index.js";
import Button from "../../class/button.js";
import banner from "../../Modules/banner-tag.js";
import pdp from "../../Modules/pdp-decoration.js";
import config from "../../../config.json" with { type: "json" };

export const name = "info-utilisateur";
export const description = "Donne des informations sur un utilisateur.";

export const cmd_builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription(
        "L'utilisateur dont vous souhaitez connaitre les informations."
      )
      .setRequired(false)
  )
  .setContexts([
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ]);

export const command = async (
  client: botClient,
  interaction: ChatInputCommandInteraction
) => {
  const getEmoji = (b: boolean) =>
    b ? config.emojis.success : config.emojis.error;

  const badges_emojis = {
    Staff: "<:discordstaff:1409161003060564149>",
    Partner: "<:discordpartner:1409160752627187896>",
    Hypesquad: "<:hypesquadevent:1409160653616451696>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1409160704975437854>",
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1409160688110141460>",
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1409160668740980857>",
    BugHunterLevel1: "<:bughunterlevel1:1409160738517418095>",
    BugHunterLevel2: "<:bughunterlevel2:1409160718783221862>",
    PremiumEarlySupporter: "<:earlysupporter:1409160640244748309>",
    VerifiedDeveloper: "<:discordearlybotdeveloper:1409160770796916847>",
    ActiveDeveloper: "<:activedeveloper:1409160797346857112>",
    MFASMS: null,
    PremiumPromoDismissed: null,
    TeamPseudoUser: null,
    HasUnreadUrgentMessages: null,
    VerifiedBot: null,
    CertifiedModerator: null,
    BotHTTPInteractions: null,
    Spammer: null,
    DisablePremium: null,
    Quarantined: null,
    Collaborator: null,
    RestrictedCollaborator: null,
  };
  
  const user = await client.users.fetch(
    interaction.options.getUser("utilisateur")?.id || interaction.user.id,
    { force: true }
  );

  let guild_user: GuildMember | undefined;
  try {
    guild_user = await interaction.guild!.members.fetch(user.id);
  } catch {}

  const admin = guild_user?.permissions.has("Administrator") || false,
    join_date = guild_user?.joinedTimestamp
      ? Math.floor(guild_user.joinedTimestamp / 1000)
      : null;

  const avatar = new Button(
    "lien",
    { text: "Avatar" },
    user.displayAvatarURL({ size: 4096 })
  );
  const row = new ActionRowBuilder<Button>().addComponents(avatar);

  if (user.bannerURL())
    row.addComponents(
      new Button("lien", { text: "Bannière" }, user.bannerURL()!)
    );
  if (!user.bot) {
    // Badges
    const badges = [];
    if (user.flags) {
      for (const b of user.flags.toArray()) {
        if (badges_emojis[b]) badges.push(badges_emojis[b]);
      }
    }

    // Guild Tag
    const guild_tag =
      user.primaryGuild?.identityGuildId === interaction.guildId;

    // Décoration d'avatar
    if (user.avatarDecorationURL())
      row.addComponents(
        new Button("lien", { text: "Décoration" }, user.avatarDecorationURL()!)
      );

    // Embed : Informations
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setDescription(" ")
      .addFields({
        name: ":information_source: - Informations",
        value: `>>> Pseudo d'affichage : **${user.displayName}**\nPseudo : **${
          user.username
        }**\nID : **${user.id}**\nCréation du compte : **<t:${Math.floor(
          user.createdTimestamp / 1000
        )}:F>** (*<t:${Math.floor(
          user.createdTimestamp / 1000
        )}:R>*)\nBot : <:croix:1408551342821212230>\n${
          badges.length > 0 ? `Badges : ${badges.join(" ")}` : ""
        }`,
      })
      .setThumbnail(user.displayAvatarURL({ size: 4096 }))
      .setImage(user.bannerURL({ size: 4096 }) as string)
      .setColor(user.accentColor || config.embed.normal)
      .setTimestamp()
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ size: 4096 }),
      });

    if (interaction.inGuild()) {
      if (guild_user) {
        embed.addFields({
          name: ":satellite: - Serveur",
          value: `>>> Propriétaire : ${getEmoji(
            interaction.guild!.ownerId === user.id
          )}\nAdministrateur : ${getEmoji(
            admin
          )}\nMembre du serveur : <:coche:1408551329026146334>\nRejoin le **<t:${join_date}:F>** (*<t:${join_date}:R>*)`,
        });
      } else {
        embed.addFields({
          name: ":satellite: - Serveur",
          value: `> Membre du serveur : <:croix:1408551342821212230>`,
        });
      }
    }

    // Embed : Guild Tag
    if (user.primaryGuild) {
      embed.addFields({
        name: ":zap: - Guild Tag",
        value: `>>> Possède un tag : ${getEmoji(
          true
        )}\nTag du serveur : ${getEmoji(guild_tag)}\nContenu : **${
          user.primaryGuild.tag
        }**`,
      });
    } else {
      embed.addFields({
        name: ":zap: - Guild Tag",
        value: `> Possède un tag : ${getEmoji(false)}`,
      });
    }

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const files: Array<AttachmentBuilder> = [];
    if (user.avatarDecorationData) {
      files.push(
        new AttachmentBuilder(
          await pdp(user.avatarDecorationData.asset, {
            id: user.id,
            avatarURL: user.displayAvatarURL({ size: 4096 }),
          })
        )
      );
      embed.setThumbnail(
        `attachment://${user.id}_${user.avatarDecorationData.asset}.gif`
      );
    }
    if (user.primaryGuild && !user.banner) {
      files.push(
        new AttachmentBuilder(
          await banner(
            user.primaryGuild.badge!,
            user.primaryGuild.identityGuildId!,
            user.primaryGuild.tag!,
            user.id
          )
        )
      );
      embed.setImage(`attachment://${user.id}_${user.primaryGuild.badge}.png`);
    }

    if (files.length > 0)
      await interaction.editReply({
        embeds: [embed],
        components: [row],
        files,
      });
  } else {
    const embed = new EmbedBuilder()
      .setTitle(user.username)
      .setDescription(" ")
      .addFields({
        name: ":information_source: - Informations",
        value: `>>> Pseudo : **${user.username}#${
          user.discriminator
        }**\nID : **${user.id}**\nCréation du compte : **<t:${Math.floor(
          user.createdTimestamp / 1000
        )}:F>** (*<t:${Math.floor(user.createdTimestamp / 1000)}:R>*)\nBot : ${
          config.emojis.success
        }`,
      })
      .setThumbnail(user.displayAvatarURL({ size: 4096 }))
      .setImage(user.bannerURL() || null)
      .setColor(user.accentColor || config.embed.normal)
      .setTimestamp()
      .setFooter({
        text: `Demandé par ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ size: 4096 }),
      });

    if (guild_user) {
      embed.addFields({
        name: ":satellite: - Serveur",
        value: `>>> Administrateur : ${admin}\nMembre du serveur : ${config.emojis.success}\nRejoin le **<t:${join_date}:F>** (*<t:${join_date}:R>*)`,
      });
    } else {
      embed.addFields({
        name: ":satellite: - Serveur",
        value: `> Membre du serveur : ${config.emojis.error}`,
      });
    }

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
