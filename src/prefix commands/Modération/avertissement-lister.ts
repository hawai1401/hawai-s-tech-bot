import {
  ActionRowBuilder,
  ContainerBuilder,
  GuildMember,
  Message,
  MessageFlags,
  type APIContainerComponent,
  type OmitPartialGroupDMChannel,
} from "discord.js";
import type { botClient, prefixCommand_data } from "../../index.js";
import config from "../../../config.json" with { type: "json" }
import { getDb } from "../../db/mongo.js";
import Container from "../../class/container.js";
import Button from "../../class/button.js";
import erreurMsg from "../../functions/errorMsg.js";
import warnMsg from "../../functions/warnMsg.js";

export const data: prefixCommand_data = {
  name: "avertissement-lister",
  alias: ["warns", "warn-list", "warnlist"],
  permission: "ManageMessages",
};

export const command = async (
  client: botClient,
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  args: Array<string>
) => {
  const user: GuildMember | null = await new Promise(async (res) => {
    try {
      res(
        await message.guild!.members.fetch(
          message.mentions.users.first() ?? args[0]!
        )
      );
    } catch {
      res(null);
    }
  });
  if (!user)
    return erreurMsg(
      "L'utilisateur est invalide ou n'est pas présent sur le serveur !",
      message
    );
  const db = getDb().Warns;
  const avertissements = await db.find({
    user: user.id,
    guild: message.guildId,
  });
  if (avertissements.length === 0)
    return warnMsg("Cet utilisateur n'as pas d'avertissement !", message);
  const container = new Container("normal")
    .addText(`## Liste des avertissements de ${user}`)
    .addSeparator("Large");
  for (const a of avertissements.slice(0, 3))
    container
      .addText(
        `### Avertissement n°${
          avertissements.findIndex((av) => av === a) + 1
        }\n>>> **ID** : ${a._id}\n**Date** : <t:${
          a.created_at / 1000
        }:F> \n**Raison** : ${a.raison}\n**Autheur** : <@${a.author}>`
      )
      .addSeparator("Small");
  container.pop();
  if (avertissements.length > 3)
    container
      .addSeparator("Large")
      .addButtons(
        new Button(
          "bleu",
          { emoji: config.emojis.arrow_left },
          `avertissementPage_${message.author.id}_${user.id}_left_1`
        ).setDisabled(),
        new Button(
          "gris",
          { text: `1/${Math.ceil(avertissements.length / 3)}` },
          `avertissementPage_${message.author.id}_middle`
        ).setDisabled(),
        new Button(
          "bleu",
          { emoji: config.emojis.arrow_right },
          `avertissementPage_${message.author.id}_${user.id}_right_1`
        )
      );

  const msg = await message.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  setTimeout(async () => {
    const actual_embed = await msg.fetch();
    const new_embed = new ContainerBuilder(
      actual_embed!.components[0]!.toJSON() as APIContainerComponent
    );
    new_embed.components.forEach((element) => {
      if (element.data.type === 1)
        (element as ActionRowBuilder<Button>).components.forEach(
          (element) => (element.data.disabled = true)
        );
    });

    await msg.edit({
      components: [new_embed],
      flags: MessageFlags.IsComponentsV2,
    });
  }, config.interaction_time);
};
