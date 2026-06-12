import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createDatabase, type AppDatabase } from "@/db/client";
import { cards, insights } from "@/db/schema";

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

describe("database setup", () => {
  it("creates all schema tables on a fresh database", () => {
    const tables = database.sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'",
      )
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toEqual(
      expect.arrayContaining([
        "sources",
        "insights",
        "insight_sources",
        "themes",
        "insight_themes",
        "theme_relationships",
        "cards",
        "digests",
        "perspectives",
        "user_settings",
      ]),
    );
  });

  it("rejects a Card without a parent Insight", () => {
    const orphanCard = {
      insightId: 999,
      question: "What has no parent?",
      answer: "This card.",
      stability: 1.0,
      difficulty: 5.0,
      dueDate: "2026-06-12",
    };

    expect(() => database.db.insert(cards).values(orphanCard).run()).toThrow(
      /FOREIGN KEY/i,
    );
  });

  it("accepts a Card linked to an existing Insight", () => {
    const insight = database.db
      .insert(insights)
      .values({ content: "FSRS optimises review timing.", state: "committed" })
      .returning()
      .get();

    const card = database.db
      .insert(cards)
      .values({
        insightId: insight.id,
        question: "What does FSRS optimise?",
        answer: "Review timing.",
        stability: 1.0,
        difficulty: 5.0,
        dueDate: "2026-06-12",
      })
      .returning()
      .get();

    expect(card.insightId).toBe(insight.id);
  });
});
