import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setAiClient, type AiClient } from "@/ai";

const fakeAi: AiClient = {
  async extractInsights(text: string) {
    expect(text).toContain("decided to adopt FSRS");
    return [{ content: "The team decided to adopt FSRS for scheduling." }];
  },
  async assignTheme() {
    return "Engineering Decisions";
  },
};

let tempDir: string;
let api: typeof import("../app/api/sources/route");

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");
  api = await import("../app/api/sources/route");
});

beforeEach(() => setAiClient(fakeAi));

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function postJson(body: unknown): Promise<Response> {
  return api.POST(
    new Request("http://localhost/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("plaintext Source ingestion", () => {
  it.each(["meeting_note", "workspace_page"] as const)(
    "ingests a %s as committed Insights",
    async (type) => {
      const response = await postJson({
        type,
        title: "Sprint planning 12 June",
        text: "We decided to adopt FSRS for the review scheduler.",
      });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.insights).toHaveLength(1);
      expect(body.insights[0].state).toBe("committed");

      const { getDatabase } = await import("@/db");
      const source = getDatabase()
        .sqlite.prepare("SELECT type, content_ref FROM sources WHERE id = ?")
        .get(body.sourceId) as { type: string; content_ref: string };
      expect(source.type).toBe(type);
      expect(source.content_ref).toBe("Sprint planning 12 June");
    },
  );

  it("rejects empty pasted text", async () => {
    const response = await postJson({
      type: "meeting_note",
      title: "Empty",
      text: "   ",
    });
    expect(response.status).toBe(400);
  });
});
