import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDatabase, type AppDatabase } from "@/db/client";
import { setSetting } from "@/settings";
import { syncToVault } from "@/vault-sync";

let tempDir: string;
let vaultDir: string;
let database: AppDatabase;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  vaultDir = path.join(tempDir, "vault");
  fs.mkdirSync(vaultDir);
  database = createDatabase(path.join(tempDir, "test.db"));
});

afterEach(() => {
  database.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("obsidian vault sync", () => {
  it("writes a markdown file for an entity when a vault path is configured", () => {
    setSetting(database, "vault_path", vaultDir);

    const writtenPath = syncToVault(database, {
      kind: "insight",
      id: 42,
      title: "Spaced repetition beats cramming",
      body: "FSRS schedules reviews at the point of forgetting.",
    });

    expect(writtenPath).not.toBeNull();
    expect(fs.existsSync(writtenPath!)).toBe(true);

    const content = fs.readFileSync(writtenPath!, "utf-8");
    expect(content).toContain("Spaced repetition beats cramming");
    expect(content).toContain("FSRS schedules reviews at the point of forgetting.");
  });

  it("skips without error when no vault path is configured", () => {
    const writtenPath = syncToVault(database, {
      kind: "insight",
      id: 1,
      title: "Unsynced insight",
      body: "This should not be written anywhere.",
    });

    expect(writtenPath).toBeNull();
    expect(fs.readdirSync(vaultDir)).toEqual([]);
  });
});
