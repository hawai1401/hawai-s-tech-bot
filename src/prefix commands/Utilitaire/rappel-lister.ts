import {
  MessageFlags,
  SectionBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  type APIContainerComponent,
  ContainerBuilder,
  Message,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import { getDb } from "../../db/mongo.js";
import config from "../../../config.json" with { type: "json" };
import type { botClient, prefixCommand_data } from "../../index.js";
import Container from "../../class/container.js";
import Button from "../../class/button.js";
import erreurMsg from "../../functions/errorMsg.js";

export const data: prefixCommand_data = {
  name: "rappel-lister",
  description: "Lister vos rappels.",
  alias: ["reminds"],
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const db = getDb().Rappels;

  const rappels = await db.find({
    user: message.author.id,
  });

  if (rappels.length === 0)
    return erreurMsg("Vous n'avez pas de rappels !", message);

  const container = new Container("normal")
    .addText("### 🔔 - Liste de vos rappels")
    .addSeparator("Large");

  for (const r of rappels.slice(0, 3))
    container
      .addSection(
        `**ID** : ${r._id}\n**Contenu** : ${r.message}\n**Date** : <t:${r.date}:F> (<t:${r.date}:R>)`,
        new Button(
          "rouge",
          { emoji: "🗑️" },
          `rappelSupprimer_${message.author.id}_${r._id}_1`
        )
      )
      .addSeparator("Small");
  container.pop();

  if (rappels.length > 3)
    container
      .addSeparator("Large")
      .addButtons(
        new Button(
          "bleu",
          { emoji: config.emojis.arrow_left },
          `rappelPage_${message.author.id}_left_1`
        ).setDisabled(),
        new Button(
          "gris",
          { text: `1/${Math.ceil(rappels.length / 3)}` },
          `rappelPage_${message.author.id}_middle`
        ).setDisabled(),
        new Button(
          "bleu",
          { emoji: config.emojis.arrow_right },
          `rappelPage_${message.author.id}_right_1`
        )
      );

  const msg = await message.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  setTimeout(async () => {
    const new_embed = new ContainerBuilder(
      msg!.components[0]!.toJSON() as APIContainerComponent
    );
    new_embed.components.forEach((element) => {
      if (element.data.type === 9)
        ((element as SectionBuilder).accessory as ButtonBuilder).data.disabled =
          true;
      if (element.data.type === 1)
        (element as ActionRowBuilder<ButtonBuilder>).components.forEach(
          (element) => (element.data.disabled = true)
        );
    });

    await message.edit({
      components: [new_embed],
      flags: MessageFlags.IsComponentsV2,
    });
  }, config.interaction_time);
};
