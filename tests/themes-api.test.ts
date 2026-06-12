import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tempDir: string;
let themesApi: typeof import("../app/api/themes/route");
let themeApi: typeof import("../app/api/themes/[id]/route");

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");
  themesApi = await import("../app/api/themes/route");
  themeApi = await import("../app/api/themes/[id]/route");
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function jsonRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/themes", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const params = (id: number) => ({ params: Promise.resolve({ id: String(id) }) });

describe("theme management", () => {
  it("creates a Theme and lists it", async () => {
    const createResponse = await themesApi.POST(
      jsonRequest("POST", { name: "Machine Learning" }),
    );
    const created = await createResponse.json();

    expect(createResponse.status).toBe(200);
    expect(created.name).toBe("Machine Learning");
    expect(created.status).toBe("committed");

    const listResponse = await themesApi.GET();
    const themes = await listResponse.json();
    expect(themes.map((t: { name: string }) => t.name)).toContain(
      "Machine Learning",
    );
  });

  it("renames a Theme", async () => {
    const created = await (
      await themesApi.POST(jsonRequest("POST", { name: "Misc" }))
    ).json();

    const renameResponse = await themeApi.PATCH(
      jsonRequest("PATCH", { name: "Productivity" }),
      params(created.id),
    );
    const renamed = await renameResponse.json();

    expect(renameResponse.status).toBe(200);
    expect(renamed.name).toBe("Productivity");
  });

  it("deletes a Theme, leaving linked Insights unthemed rather than deleted", async () => {
    const { getDatabase } = await import("@/db");
    const { insights, themes, insightThemes } = await import("@/db/schema");
    const database = getDatabase();

    const theme = database.db
      .insert(themes)
      .values({ name: "Doomed Theme", status: "committed" })
      .returning()
      .get();
    const insight = database.db
      .insert(insights)
      .values({ content: "Survives theme deletion", state: "committed" })
      .returning()
      .get();
    database.db
      .insert(insightThemes)
      .values({ insightId: insight.id, themeId: theme.id })
      .run();

    const deleteResponse = await themeApi.DELETE(
      jsonRequest("DELETE"),
      params(theme.id),
    );
    expect(deleteResponse.status).toBe(200);

    const remainingInsight = database.sqlite
      .prepare("SELECT id FROM insights WHERE id = ?")
      .get(insight.id);
    expect(remainingInsight).toBeDefined();

    const orphanLinks = database.sqlite
      .prepare("SELECT * FROM insight_themes WHERE theme_id = ?")
      .all(theme.id);
    expect(orphanLinks).toHaveLength(0);
  });

  it("links two Themes as related, queryable from both directions", async () => {
    const a = await (
      await themesApi.POST(jsonRequest("POST", { name: "Theme A" }))
    ).json();
    const b = await (
      await themesApi.POST(jsonRequest("POST", { name: "Theme B" }))
    ).json();

    const linkResponse = await themeApi.PATCH(
      jsonRequest("PATCH", { addRelatedThemeId: b.id }),
      params(a.id),
    );
    expect(linkResponse.status).toBe(200);

    const listResponse = await themesApi.GET();
    const themes = await listResponse.json();
    const themeA = themes.find((t: { id: number }) => t.id === a.id);
    const themeB = themes.find((t: { id: number }) => t.id === b.id);

    expect(themeA.relatedThemeIds).toContain(b.id);
    expect(themeB.relatedThemeIds).toContain(a.id);
  });

  it("rejects creating a Theme with an empty name", async () => {
    const response = await themesApi.POST(jsonRequest("POST", { name: "  " }));
    expect(response.status).toBe(400);
  });
});
