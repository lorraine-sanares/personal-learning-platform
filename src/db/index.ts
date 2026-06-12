import fs from "node:fs";
import path from "node:path";
import { createDatabase, type AppDatabase } from "./client";

let instance: AppDatabase | null = null;

export function getDatabase(): AppDatabase {
  if (!instance) {
    const dbPath =
      process.env.DB_PATH ?? path.join(process.cwd(), "data", "app.db");
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    instance = createDatabase(dbPath);
  }
  return instance;
}
