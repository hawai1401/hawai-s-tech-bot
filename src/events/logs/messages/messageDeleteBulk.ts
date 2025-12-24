import {
  EmbedBuilder,
  TextChannel,
  type GuildTextBasedChannel,
  type Message,
  type PartialMessage,
  type ReadonlyCollection,
  type Snowflake,
} from "discord.js";
import type { botClient } from "../../../index.js";
import config from "../../../../config.json" with { type: "json" };

export const type = "messageDeleteBulk";
export const event = async (
  client: botClient,
  messages: ReadonlyCollection<Snowflake, Message<true> | PartialMessage<true>>,
  channel: GuildTextBasedChannel
) => {
  let lastMessage: Message<true> | PartialMessage<true> = messages.last()!;
  const embeds: EmbedBuilder[] = [];
  for (const [_, m] of messages) {
    if (!m.content) continue;
    embeds.push(
      new EmbedBuilder()
        .setColor(config.embed.error)
        .addFields({
          name: "👤 - Autheur",
          value: m.author
            ? `>>> **ID** : ${m.author.id}\n**Pseudo** : ${m.author.username}`
            : "> Inconnu",
        })
        .addFields({
          name: "💬 - Contenu",
          value: m.content.slice(0, 1024),
        })
        .addFields({
          name: "📌 - Salon",
          value: `>>> ${channel} \`${channel.name}\``,
        })
        .setFooter({
          text: "Message supprimé",
          iconURL: m.guild!.iconURL() ?? "",
        })
        .setTimestamp()
    );
    lastMessage = m;
  }

  if (embeds.length === 0) return;
  client.snipes.set(lastMessage.channelId, lastMessage);

  const log_channel = (await client.channels.fetch(
    "1413831997293461585"
  )) as TextChannel;

  for (let i = 0; i < embeds.length; i += 10)
    log_channel.send({
      embeds: embeds.slice(i, i + 10),
    });
};
