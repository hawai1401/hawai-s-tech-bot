import { MessageFlags, type ButtonInteraction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";
import Container from "../../class/container.js";
import Button from "../../class/button.js";
import config from "../../../config.json" with { type: "json" };

export const event = async (
  client: botClient,
  interaction: ButtonInteraction
) => {
  await interaction.deferUpdate();
  const actual_page = Number(interaction.customId.split("_")[4]);
  const direction = interaction.customId.split("_")[3] as "left" | "right";
  const user = await client.users.fetch(interaction.customId.split("_")[2]!);
  const db = getDb().Warns;
  const avertissements = await db.find({
    user: user.id,
    guild: interaction.guildId,
  });

  const container = new Container("normal")
    .addText(`## Liste des avertissements de ${user}`)
    .addSeparator("Large");

  const left_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_left },
    `avertissementPage_${interaction.user.id}_${user.id}_left_${
      direction === "right" ? actual_page + 1 : actual_page - 1
    }`
  );
  const right_btn = new Button(
    "bleu",
    { emoji: config.emojis.arrow_right },
    `avertissementPage_${interaction.user.id}_${user.id}_right_${
      direction === "right" ? actual_page + 1 : actual_page - 1
    }`
  );

  if (direction === "right") {
    for (const a of avertissements.slice(
      3 * actual_page,
      3 * (actual_page + 1)
    ))
      container
        .addText(
          `### Avertissement n°${
            avertissements.findIndex((av) => av === a) + 1
          }\n>>> **ID** : ${a._id}\n**Date** : <t:${
            a.created_at / 1000
          }:F> \n**Raison** : ${a.raison}\n**Autheur** : <@${a.author}>`
        )
        .addSeparator("Small");

    if (actual_page + 1 === Math.ceil(avertissements.length / 3))
      right_btn.setDisabled();
  }

  if (direction === "left") {
    for (const a of avertissements.slice(
      3 * (actual_page - 2),
      3 * (actual_page - 1)
    ))
      container
        .addText(
          `### Avertissement n°${
            avertissements.findIndex((av) => av === a) + 1
          }\n>>> **Date** : <t:${a.created_at / 1000}:F> \n**Raison** : ${
            a.raison
          }\n**Autheur** : <@${a.author}>`
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
          }/${Math.ceil(avertissements.length / 3)}`,
        },
        `avertissementPage_${interaction.user.id}_middle`
      ).setDisabled(),
      right_btn
    );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
};
