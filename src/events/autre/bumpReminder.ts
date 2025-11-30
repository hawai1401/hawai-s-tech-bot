import {
  EmbedBuilder,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
let isBumping = false;

export const type = "messageCreate";
export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>
) => {
  if (!message.interactionMetadata) return;
  const bots = [
    "1136004066665836635", // Bumpfy
    "966999633329012756", // Akatsuki
    "302050872383242240", // Disboard
  ];
  if (
    bots.includes(message.author.id) &&
    message.interactionMetadata &&
    !isBumping
  ) {
    isBumping = true;
    setTimeout(() => {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed.normal)
            .setTitle("Bump effectué !")
            .setDescription(
              `Merci à ${
                message.interactionMetadata!.user
              } d'avoir bump la serveur !\n> Je vous rappelerai de bump le serveur dans <t:${
                Math.floor(Date.now() / 1000) + 60 * 60 * 2
              }:R>.`
            ),
        ],
      });
    }, 60 * 1_000);
    setTimeout(() => {
      isBumping = false;
      message.channel.send({
        content: "<@&1384271104834670654>",
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed.normal)
            .setTitle("Vous pouvez de nouveau bump le serveur !")
            .setDescription(
              `- <@1136004066665836635> : </bump:1242970194683494410>\n- <@302050872383242240> : </bump:1136019903434997770>\n- <@966999633329012756> : </bump:947088344167366698>`
            ),
        ],
      });
    }, 2 * 60 * 60 * 1_000);
  }
};
