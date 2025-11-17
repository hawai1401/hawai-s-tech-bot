import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  type AnySelectMenuInteraction,
} from "discord.js";
import config from "../../config.json" with { type: "json" };
import Container from "../class/container.js";

export default async function success(
  message: string,
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | AnySelectMenuInteraction,
  options?: {
    isDefered?: boolean;
    followUp?: boolean
    notEphemeral?: boolean;
  }
) {
  const res = {
    components: [
      new Container("success").addText(
        `### ${config.emojis.success} - ${message}`
      ),
    ],
    flags: 32832,
  };
  if (options?.notEphemeral) res.flags = 32768;
  if (options?.followUp) return interaction.followUp(res)
  if (options?.isDefered) return interaction.editReply(res);
  if (interaction instanceof ChatInputCommandInteraction)
    return interaction.reply(res);
  return interaction.update(res);
}
