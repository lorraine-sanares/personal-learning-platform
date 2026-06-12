import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tempDir: string;
let insightsApi: typeof import("../app/api/insights/route");
let commitApi: typeof import("../app/api/insights/[id]/commit/route");
let insightApi: typeof import("../app/api/insights/[id]/route");

let draftId: number;
let themeId: number;

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");

  insightsApi = await import("../app/api/insights/route");
  commitApi = await import("../app/api/insights/[id]/commit/route");
  insightApi = await import("../app/api/insights/[id]/route");

  const { getDatabase } = await import("@/db");
  const { insights, themes, sources, insightSources } = await import("@/db/schema");
  const database = getDatabase();

  const source = database.db
    .insert(sources)
    .values({ type: "image", contentRef: "whiteboard.png" })
    .returning()
    .get();
  const draft = database.db
    .insert(insights)
    .values({ content: "Draft insight from OCR", state: "draft" })
    .returning()
    .get();
  database.db
    .insert(insightSources)
    .values({ insightId: draft.id, sourceId: source.id })
    .run();
  draftId = draft.id;

  themeId = database.db
    .insert(themes)
    .values({ name: "Whiteboarding", status: "committed" })
    .returning()
    .get().id;
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

const params = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

describe("backlog triage", () => {
  it("lists Draft Insights with their Source reference", async () => {
    const response = await insightsApi.GET(
      new Request("http://localhost/api/insights?state=draft"),
    );
    const drafts = await response.json();

    expect(response.status).toBe(200);
    const draft = drafts.find((d: { id: number }) => d.id === draftId);
    expect(draft.content).toBe("Draft insight from OCR");
    expect(draft.sourceRefs).toContain("whiteboard.png");
  });

  it("rejects committing without at least one Theme", async () => {
    const response = await commitApi.POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeIds: [] }),
      }),
      params(draftId),
    );
    expect(response.status).toBe(400);
  });

  it("commits a Draft Insight to Themes and removes it from the Backlog", async () => {
    const response = await commitApi.POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeIds: [themeId] }),
      }),
      params(draftId),
    );
    const committed = await response.json();

    expect(response.status).toBe(200);
    expect(committed.state).toBe("committed");

    const { getDatabase } = await import("@/db");
    const links = getDatabase()
      .sqlite.prepare("SELECT theme_id FROM insight_themes WHERE insight_id = ?")
      .all(draftId) as { theme_id: number }[];
    expect(links.map((l) => l.theme_id)).toContain(themeId);

    const backlog = await (
      await insightsApi.GET(new Request("http://localhost/api/insights?state=draft"))
    ).json();
    expect(backlog.find((d: { id: number }) => d.id === draftId)).toBeUndefined();
  });

  it("discards a Draft Insight permanently", async () => {
    const { getDatabase } = await import("@/db");
    const { insights } = await import("@/db/schema");
    const doomed = getDatabase()
      .db.insert(insights)
      .values({ content: "Low quality extraction", state: "draft" })
      .returning()
      .get();

    const response = await insightApi.DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      params(doomed.id),
    );
    expect(response.status).toBe(200);

    const remaining = getDatabase()
      .sqlite.prepare("SELECT id FROM insights WHERE id = ?")
      .get(doomed.id);
    expect(remaining).toBeUndefined();
  });
});
