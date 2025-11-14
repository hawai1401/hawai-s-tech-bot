import {
  Partials,
  Collection,
  Client,
  ClientUser,
  ModalBuilder,
  ButtonInteraction,
  type AnySelectMenuInteraction,
  ContainerBuilder,
} from "discord.js";
import { config } from "dotenv";
config({ quiet: true });
import { connect } from "./db/mongo.js";
import { deployementEvent } from "./handlers/events.js";

export class botClient extends Client {
  public commands: Collection<string, void>;
  public modals: Collection<
    string,
    [
      ModalBuilder,
      ButtonInteraction | AnySelectMenuInteraction,
      ContainerBuilder,
      ...any
    ]
  >;

  constructor(options: ConstructorParameters<typeof Client>[0]) {
    super(options);
    this.commands = new Collection();
    this.modals = new Collection();
  }
  // @ts-expect-error
  override user: ClientUser;
}

const client = new botClient({
  intents: 53608447,
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.SoundboardSound,
    Partials.User,
    Partials.ThreadMember,
  ],
}).setMaxListeners(0);

connect().then(async () => {
  // Déployer les events
  console.log("Déploiement des events ...");
  await deployementEvent(client);
  console.log("Events déployés avec succès !");
  client.login(process.env.TOKEN_DEV);
});
