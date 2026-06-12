import { eq } from "drizzle-orm";
import type { AppDatabase } from "./db/client";
import { userSettings } from "./db/schema";

export const DEFAULT_SETTINGS: Record<string, string> = {
  daily_card_limit: "15",
  vault_path: "",
};

export function seedDefaultSettings(database: AppDatabase): void {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    database.db
      .insert(userSettings)
      .values({ key, value })
      .onConflictDoNothing()
      .run();
  }
}

export function getSetting(database: AppDatabase, key: string): string | undefined {
  const row = database.db
    .select()
    .from(userSettings)
    .where(eq(userSettings.key, key))
    .get();
  return row?.value;
}

export function setSetting(database: AppDatabase, key: string, value: string): void {
  database.db
    .insert(userSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: userSettings.key, set: { value } })
    .run();
}
