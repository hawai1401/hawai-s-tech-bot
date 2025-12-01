import { EmbedBuilder, type Invite, type TextChannel } from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "inviteCreate";

export const event = async (client: botClient, invite: Invite) => {
  if (!invite.inviterId) return;
  const inviteur = await client.users.fetch(invite.inviterId);
  const embed = new EmbedBuilder()
    .setColor(config.embed.success)
    .setThumbnail(inviteur.displayAvatarURL())
    .addFields({
      name: "🔗 - Invitation",
      value: `>>> **Salon** : ${invite.channel} \`${invite.channel!.name}\`
         **Nombre maximum d'utilisation** : ${
           invite.maxUses && invite.maxUses === 0
             ? "♾️"
             : invite.maxUses
             ? invite.maxUses
             : "Inconnu"
         }\n**Lien** : ${invite.url}\n**Expire** ${
        invite.expiresTimestamp
          ? `<t:${Math.floor(
              invite.expiresTimestamp / 1000
            )}:R> (<t:${Math.floor(invite.expiresTimestamp / 1000)}:F>)`
          : "Jamais"
      }\n**Temporaire** : ${
        invite.temporary ? config.emojis.success : config.emojis.error
      }`,
    })
    .addFields({
      name: "👤 - Inviteur",
      value: `>>> **ID** : ${invite.inviterId}\n**Pseudo** : ${inviteur.username}`,
    })
    .setFooter({
      text: "Invitation créée",
      iconURL: invite.guild?.iconURL() ?? "",
    })
    .setTimestamp();

  const channel = (await client.channels.fetch(
    "1445024679856181323"
  )) as TextChannel;
  channel.send({ embeds: [embed] });
};
