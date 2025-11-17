import { MessageFlags, type ButtonInteraction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";
import { ObjectId } from "mongodb";
import success from "../../functions/success.js";
import Button from "../../class/button.js";
import Container from "../../class/container.js";
import warn from "../../functions/warn.js";
import config from "../../../config.json" with { type: "json" };

export const event = async (
  client: botClient,
  interaction: ButtonInteraction
) => {
  await interaction.deferUpdate();
  const rappel_id = interaction.customId.split("_")[2]!;
  let actual_page = Number(interaction.customId.split("_")[3]);
  const db = getDb().collection("Rappels");
  await db.deleteOne({ _id: new ObjectId(rappel_id) });

  const rappels_full = (await db
    .find({
      user: interaction.user.id,
    })
    .toArray()) as Array<{
    _id: ObjectId;
    user: string;
    message: string;
    date: number;
  }>;
  let rappels = rappels_full.slice(
    (actual_page - 1) * 3,
    actual_page * 3
  ) as Array<{
    _id: ObjectId;
    user: string;
    message: string;
    date: number;
  }>;

  if (rappels_full.length === 0)
    return warn("Vous n'avez plus de rappel !", interaction, {
      isDefered: true,
    });

  if (rappels.length === 0) {
    rappels = rappels_full.slice(
      (actual_page - 2) * 3,
      (actual_page - 1) * 3
    ) as Array<{
      _id: ObjectId;
      user: string;
      message: string;
      date: number;
    }>;
    actual_page--;
  }

  const container = new Container("normal")
    .addText("### 🔔 - Liste de vos rappels")
    .addSeparator("Large");

  const left_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_left },
    `rappelPage_${interaction.user.id}_left_${actual_page}`
  );
  const right_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_right },
    `rappelPage_${interaction.user.id}_right_${actual_page}`
  );

  for (const r of rappels)
    container
      .addSection(
        `**Contenu** : ${r.message}\n**Date** : <t:${r.date}:F> (<t:${r.date}:R>)`,
        new Button(
          "rouge",
          { emoji: "🗑️" },
          `rappelSupprimer_${interaction.user.id}_${r._id}_${actual_page}`
        )
      )
      .addSeparator("Small");

  if (actual_page === Math.ceil(rappels_full.length / 3))
    right_btn.setDisabled();

  if (actual_page === 1) left_btn.setDisabled();

  container
    .pop()
    .addSeparator("Large")
    .addButtons(
      left_btn,
      new Button(
        "gris",
        {
          text: `${actual_page}/${Math.ceil(rappels_full.length / 3)}`,
        },
        `rappelPage_${interaction.user.id}_middle`
      ).setDisabled(),
      right_btn
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
  await success("Rappel supprimer avec succès !", interaction, {
    isDefered: true,
    followUp: true,
  });
};
