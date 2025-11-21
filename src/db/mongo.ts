import mongoose, { Schema } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

let db: typeof mongoose;

interface Rappel {
  user: string;
  message: string;
  date: number;
  created_at: number;
}

interface Warn {
  guild: string;
  author: string;
  user: string;
  raison: string;
  created_at: number;
}

export const connect = async () => {
  db = await mongoose.connect(process.env.DB as string);
  const rappels = new Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    date: { immutable: true, type: Number, required: true },
    created_at: {
      type: Number,
      default: () => Date.now(),
    },
  });
  const warns = new Schema({
    guild: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    raison: {
      type: String,
      required: true,
    },
    created_at: {
      immutable: true,
      type: Number,
      default: () => Date.now(),
    },
  });
  mongoose.model<Rappel>("Rappels", rappels);
  mongoose.model<Warn>("Warns", warns);
};

export function getDb() {
  if (!db || !db.connection.db)
    throw new Error("La base de données n'est pas encore connectée.");
  return {
    Rappels: db.models.Rappels as mongoose.Model<Rappel>,
    Warns: db.models.Warns as mongoose.Model<Warn>,
    db: db.connection.db,
  };
}
