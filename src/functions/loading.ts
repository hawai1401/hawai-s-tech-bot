import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  type AnySelectMenuInteraction,
} from "discord.js";
import config from "../../config.json" with { type: "json" };
import Container from "../class/container.js";

export default async function loading(
  message: string,
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | AnySelectMenuInteraction,
  options?: { defered?: boolean; followUp?: boolean, ephemeral?: boolean; }
) {
  const res = {
    components: [
      new Container("normal").addText(`${config.emojis.loading}   ${message}...`),
    ],
    flags: 32768,
  };
  if (options?.ephemeral) res.flags = 32832
  if (options?.defered) return interaction.editReply(res);
  if (options?.followUp) return interaction.followUp(res);
  if (interaction instanceof ChatInputCommandInteraction)
    return interaction.reply(res);
  return interaction.update(res);
}
