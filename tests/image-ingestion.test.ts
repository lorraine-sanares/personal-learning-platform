import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setAiClient, type AiClient } from "@/ai";
import { setOcrEngine } from "@/ingestion/ocr";

const fakeAi: AiClient = {
  async extractInsights(text: string) {
    expect(text).toContain("handwritten note about deliberate practice");
    return [
      { content: "Deliberate practice requires focused feedback loops." },
      { content: "Skill plateaus break through targeted drills." },
    ];
  },
  async assignTheme() {
    throw new Error("Theme assignment must not run for Draft Insights");
  },
};

let tempDir: string;
let api: typeof import("../app/api/sources/route");

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");
  api = await import("../app/api/sources/route");
});

beforeEach(() => {
  setAiClient(fakeAi);
  setOcrEngine({
    async transcribe() {
      return "A handwritten note about deliberate practice and feedback.";
    },
  });
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("image Source ingestion (OCR)", () => {
  it("ingests an image and stores Draft Insights awaiting Backlog triage", async () => {
    const formData = new FormData();
    formData.append("type", "image");
    formData.append(
      "file",
      new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "note.png", {
        type: "image/png",
      }),
    );

    const response = await api.POST(
      new Request("http://localhost/api/sources", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.insights).toHaveLength(2);
    for (const insight of body.insights) {
      expect(insight.state).toBe("draft");
    }

    const { getDatabase } = await import("@/db");
    const database = getDatabase();

    const source = database.sqlite
      .prepare("SELECT type FROM sources WHERE id = ?")
      .get(body.sourceId) as { type: string };
    expect(source.type).toBe("image");

    const themedDrafts = database.sqlite
      .prepare(
        `SELECT t.theme_id FROM insight_themes t
         JOIN insights i ON i.id = t.insight_id
         WHERE i.state = 'draft'`,
      )
      .all();
    expect(themedDrafts).toHaveLength(0);
  });

  it("returns 422 when OCR finds no text", async () => {
    setOcrEngine({
      async transcribe() {
        return "   ";
      },
    });

    const formData = new FormData();
    formData.append("type", "image");
    formData.append(
      "file",
      new File([new Uint8Array([0x89])], "blank.png", { type: "image/png" }),
    );

    const response = await api.POST(
      new Request("http://localhost/api/sources", {
        method: "POST",
        body: formData,
      }),
    );
    expect(response.status).toBe(422);
  });
});
