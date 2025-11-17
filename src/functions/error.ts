import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  type AnySelectMenuInteraction,
} from "discord.js";
import config from "../../config.json" with { type: "json" };
import Container from "../class/container.js";

export default async function erreur(
  erreur: string,
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | AnySelectMenuInteraction,
  options?: {
    isDefered?: boolean;
    notEphemeral?: boolean;
  }
) {
  const res = {
    components: [
      new Container("error").addText(`### ${config.emojis.error} - ${erreur}`),
    ],
    flags: 32832,
  };
  if (options?.notEphemeral) res.flags = 32768;
  if (options?.isDefered) return interaction.editReply(res);
  if (interaction instanceof ChatInputCommandInteraction)
    return interaction.reply(res);
  return interaction.update(res);
}
