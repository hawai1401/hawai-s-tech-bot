import type {
  AnyThreadChannel,
  PartialThreadMember,
  ReadonlyCollection,
  Snowflake,
  ThreadMember,
} from "discord.js";
import type { botClient } from "../../../index.js";

export const type = "threadMembersUpdate";

export const event = async (
  client: botClient,
  addedMembers: ReadonlyCollection<Snowflake, ThreadMember>,
  removedMembers: ReadonlyCollection<
    Snowflake,
    ThreadMember | PartialThreadMember
  >,
  thread: AnyThreadChannel
) => {};
