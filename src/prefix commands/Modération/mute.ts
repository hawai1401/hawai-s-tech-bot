import {
  ActionRowBuilder,
  EmbedBuilder,
  GuildMember,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import ms, { type StringValue } from "ms";
import type { botClient, prefixCommand_data } from "../../index.js";
import Button from "../../class/button.js";
import config from "../../../config.json" with { type: "json" }
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "mute",
  description: "Rendre un utilisateur temporairement muet.",
  alias: ["demute"],
  permission: "ModerateMembers",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const user: GuildMember | null = await new Promise(async (res) => {
    try {
      res(
        await message.guild!.members.fetch(
          message.mentions.users.first() ?? args[0]!
        )
      );
    } catch {
      res(null);
    }
  });
  if (!user) return erreurMsg("Utilisateur invalide !", message);
  const duree = args[1];
  if (!duree) return erreurMsg("Durée invalide !", message);
  const raison = args.slice(2).join(" ") || "Aucune raison fournie";

  // Utilisateur veut se mute lui-même
  if (message.author.id === user.id)
    return erreurMsg(
      "Vous ne pouvez pas vous rendre muet :stuck_out_tongue:",
      message
    );

  // Utilisateur veut mute le bot
  if (user.id === client.user.id)
    return erreurMsg(
      "Il en faudra plus pour me faire taire :stuck_out_tongue:",
      message
    );

  // Utilisateur est au-dessus de la personne à mute ?
  const member_highthest_role = message.member!.roles.highest.position;
  const user_highthest_role = user.roles.highest.position;
  if (
    (member_highthest_role <= user_highthest_role &&
      message.member!.id !== message.guild!.ownerId) ||
    user.id === message.guild!.ownerId
  )
    return erreurMsg(
      "Vous ne pouvez pas rendre muet un utilisateur qui supérieur ou égal à vous !",
      message
    );

  // Bot peut mute la personne ?
  if (!message.guild!.members.me!.permissions.has("ModerateMembers"))
    return erreurMsg(
      "Je n'ai pas la permission de rendre muet un membre !",
      message
    );

  if (message.guild!.members.me!.roles.highest.position <= user_highthest_role)
    return erreurMsg(
      "Mon rôle dans la hiérarchie est inférieur ou égale à celui du membre que vous souhaitez rendre muet !",
      message
    );

  // Utilisateur admin ?
  if (user.permissions.has("Administrator"))
    return erreurMsg(
      "Je n'ai pas la permission de rendre muet ce membre car il a la permission administrateur !",
      message
    );

  // Durée valide ?
  try {
    const duree_ms = ms(duree as StringValue);
    if (!duree_ms) throw new Error("Durée invalide");

    if (duree_ms > 2419200000) throw new Error("Durée trop longue");
  } catch (e) {
    return erreurMsg(
      "La durée entrée est invalide !\n\n>>> `1 semaine` <:arrow_righ:1411387131401867416> `1w`\n`1 jour` <:arrow_righ:1411387131401867416> `1d`\n`1 heure` <:arrow_righ:1411387131401867416> `1h`\n`1 minute` <:arrow_righ:1411387131401867416> `1m`",
      message
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
      `editMute_${message.author.id}_${user.id}_${
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
        text: `Demandé par ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    return setTimeout(async () => {
      btn.setDisabled();
      try {
        await message.reply({ embeds: [embed], components: [row] });
      } catch {}
    }, config.interaction_time);
  }

  const duree_ms = ms(duree as StringValue);
  const fin_mute = new Date(Date.now() + duree_ms);

  const raison_mute = `@${message.author.tag} (${
    message.author.id
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
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  await message.reply({ embeds: [embed] });

  const embed_DM = new EmbedBuilder()
    .setTitle(`${config.emojis.warn} - Muet`)
    .setDescription(`> Vous venez d'être rendu muet !`)
    .setFields(
      {
        name: ":satellite: - Serveur",
        value: `\`\`\`${message.guild!.name}\`\`\``,
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
      text: `Demandé par ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await client.users.send(user.id, { embeds: [embed_DM] });
  } catch {}
};
