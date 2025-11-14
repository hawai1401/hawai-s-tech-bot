import { Db, MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });
const client = new MongoClient(process.env.DB as string);

let db: Db;

export async function connect() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
}

export function getDb() {
  if (!db) throw new Error("La base de données n'est pas encore connectée.");
  return db;
}
