import type { Interaction } from "discord.js";
import type { botClient } from "../../index.js";
import { getDb } from "../../db/mongo.js";

export const type = "interactionCreate";
export const event = async (client: botClient, interaction: Interaction) => {
  if (
    !interaction.isAutocomplete() ||
    interaction.commandName !== "avertissement"
  )
    return;

  const focusedValue = interaction.options.getFocused();
  if (interaction.options.getSubcommand() === "ajouter") {
    const choices = [
      { name: "Spam", value: "Spam" },
      {
        name: "Insultes envers un membre",
        value: "Insultes envers un membre",
      },
      { name: "Langage inapproprié", value: "Langage inapproprié" },
      {
        name: "Provocation ou conflit volontaire",
        value: "Provocation ou conflit volontaire",
      },
      {
        name: "Diffusion d’informations personnelles",
        value: "Diffusion d’informations personnelles",
      },
      { name: "Contenu NSFW", value: "Contenu NSFW" },
      {
        name: "Publicité non autorisée",
        value: "Publicité non autorisée",
      },
      {
        name: "Utilisation abusive des salons",
        value: "Utilisation abusive des salons",
      },
      {
        name: "Non-respect des consignes du staff",
        value: "Non-respect des consignes du staff",
      },
      {
        name: "Bruit excessif en vocal",
        value: "Bruit excessif en vocal",
      },
      { name: "Comportement toxique", value: "Comportement toxique" },
      {
        name: "Envoi de liens suspects",
        value: "Envoi de liens suspects",
      },
      {
        name: "Spoil sans avertissement",
        value: "Spoil sans avertissement",
      },
      { name: "Harcèlement", value: "Harcèlement" },
    ];
    return await interaction.respond(
      choices.filter((r) => r.name.startsWith(focusedValue))
    );
  } else {
    const membre = (await client.users.fetch(interaction.options.get("membre", true).value as string));
    if (!membre)
      return await interaction.respond([
        {
          name: "Veuillez saisir le membre avant de choisir l'avertissement à supprimer.",
          value:
            "null;Veuillez saisir le membre avant de choisir l'avertissement à supprimer.",
        },
      ]);
    const avertissements = await getDb().Warns.find({
      user: membre.id,
    });
    if (avertissements.length === 0)
      return await interaction.respond([
        {
          name: "Ce membre n'a aucun avertissement.",
          value: "null;Ce membre n'a aucun avertissement.",
        },
      ]);
    const avertissements_map = avertissements.map((a) => {
      return {
        name: `${a.raison} ${new Date(a.created_at).toLocaleString()}`,
        value: String(a._id),
      };
    });

    await interaction.respond(
      avertissements_map.filter((a) => a.name.startsWith(focusedValue))
    );
  }
};
