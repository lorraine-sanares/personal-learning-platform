import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDatabase, type AppDatabase } from "@/db/client";
import { getSetting, setSetting } from "@/settings";

let tempDir: string;
let database: AppDatabase;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  database = createDatabase(path.join(tempDir, "test.db"));
});

afterEach(() => {
  database.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("user settings", () => {
  it("seeds default settings on first run", () => {
    expect(getSetting(database, "daily_card_limit")).toBe("15");
    expect(getSetting(database, "vault_path")).toBe("");
  });

  it("persists an updated setting across database reopen", () => {
    setSetting(database, "daily_card_limit", "20");
    expect(getSetting(database, "daily_card_limit")).toBe("20");

    database.close();
    database = createDatabase(path.join(tempDir, "test.db"));

    expect(getSetting(database, "daily_card_limit")).toBe("20");
  });
});
