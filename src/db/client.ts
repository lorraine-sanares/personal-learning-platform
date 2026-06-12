import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import * as schema from "./schema";
import { seedDefaultSettings } from "../settings";

export interface AppDatabase {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
  close: () => void;
}

const migrationsFolder = path.join(process.cwd(), "drizzle");

export function createDatabase(dbPath: string): AppDatabase {
  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  const database: AppDatabase = { db, sqlite, close: () => sqlite.close() };
  seedDefaultSettings(database);
  return database;
}
