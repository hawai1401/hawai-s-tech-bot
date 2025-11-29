import {
  MessageFlags,
  type Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient } from "../../index.js";
import config from "../../../config.json" with { type: "json" };
import Container from "../../class/container.js";
import { eventSlash } from "../../logger.js";

export const type = "messageCreate";

export const event = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>
) => {
  if (
    !message.guild ||
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

  eventSlash(
    message.content.split(" ")[0]!.slice(config.prefix.length),
    message.author.tag,
    message.author.id,
    message.guild.name,
    message.guildId!
  );

  await cmd(client, message, message.content.split(" ").slice(1));
};
