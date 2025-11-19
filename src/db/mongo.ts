import mongoose, { Schema } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

let db: typeof mongoose;

export const connect = async () => {
  db = await mongoose.connect(process.env.DB as string);
  const rappel = new Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Number, required: true },
    created_at: {
      type: Number,
      default: () => Date.now()
    }
  });
  mongoose.model("Rappels", rappel);
};

export function getDb() {
  if (!db || !db.connection.db)
    throw new Error("La base de données n'est pas encore connectée.");
  return { Rappels: db.models.Rappels!, db: db.connection.db };
}
