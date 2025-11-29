import {
  Partials,
  Collection,
  Client,
  ClientUser,
  ModalBuilder,
  ButtonInteraction,
  type AnySelectMenuInteraction,
  ContainerBuilder,
  Message,
  type OmitPartialGroupDMChannel,
  type PartialMessage,
  type Interaction,
} from "discord.js";
import { config } from "dotenv";
config({ quiet: true });
import { connect } from "./db/mongo.js";
import { deployementEvent } from "./handlers/events.js";

export class botClient extends Client {
  public commands: Collection<
    string,
    (client: botClient, interaction: Interaction) => Promise<void>
  >;
  public prefixCommands: Collection<
    {
      name: string;
      alias: Array<string>;
    },
    (
      client: botClient,
      message: OmitPartialGroupDMChannel<Message<boolean>>,
      args: Array<string>
    ) => Promise<void>
  >;
  public modals: Collection<
    string,
    [
      ModalBuilder,
      ButtonInteraction | AnySelectMenuInteraction,
      ContainerBuilder,
      ...any
    ]
  >;
  public snipes: Collection<
    string,
    OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>
  >;

  constructor(options: ConstructorParameters<typeof Client>[0]) {
    super(options);
    this.commands = new Collection();
    this.prefixCommands = new Collection();
    this.modals = new Collection();
    this.snipes = new Collection();
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
