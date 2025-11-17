import { MessageFlags, type ButtonInteraction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";
import type { ObjectId } from "mongodb";
import Container from "../../class/container.js";
import Button from "../../class/button.js";
import config from "../../../config.json" with { type: "json" };

export const event = async (
  client: botClient,
  interaction: ButtonInteraction
) => {
  await interaction.deferUpdate();
  const actual_page = Number(interaction.customId.split("_")[3]);
  const direction = interaction.customId.split("_")[2] as "left" | "right";
  const db = getDb().collection("Rappels");
  const rappels = (await db
    .find({
      user: interaction.user.id,
    })
    .toArray()) as Array<{
    _id: ObjectId;
    user: string;
    message: string;
    date: number;
  }>;

  const container = new Container("normal")
    .addText("### 🔔 - Liste de vos rappels")
    .addSeparator("Large");

  const left_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_left },
    `rappelPage_${interaction.user.id}_left_${
      direction === "right" ? actual_page + 1 : actual_page - 1
    }`
  );
  const right_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_right },
    `rappelPage_${interaction.user.id}_right_${
      direction === "right" ? actual_page + 1 : actual_page - 1
    }`
  );

  if (direction === "right") {
    for (const r of rappels.slice(3 * actual_page, 3 * (actual_page + 1)))
      container
        .addSection(
          `**Contenu** : ${r.message}\n**Date** : <t:${r.date}:F> (<t:${r.date}:R>)`,
          new Button(
            "rouge",
            { emoji: "🗑️" },
            `rappelSupprimer_${interaction.user.id}_${r._id}_${actual_page + 1}`
          )
        )
        .addSeparator("Small");

    if (actual_page + 1 === Math.ceil(rappels.length / 3))
      right_btn.setDisabled();
  }

  if (direction === "left") {
    for (const r of rappels.slice(3 * (actual_page - 2), 3 * (actual_page - 1)))
      container
        .addSection(
          `**Contenu** : ${r.message}\n**Date** : <t:${r.date}:F> (<t:${r.date}:R>)`,
          new Button(
            "rouge",
            { emoji: "🗑️" },
            `rappelSupprimer_${interaction.user.id}_${r._id}_${actual_page - 1}`
          )
        )
        .addSeparator("Small");

    if (actual_page - 1 === 1) left_btn.setDisabled();
  }

  container
    .pop()
    .addSeparator("Large")
    .addButtons(
      left_btn,
      new Button(
        "gris",
        {
          text: `${
            direction === "right" ? actual_page + 1 : actual_page - 1
          }/${Math.ceil(rappels.length / 3)}`,
        },
        `rappelPage_${interaction.user.id}_middle`
      ).setDisabled(),
      right_btn
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};
