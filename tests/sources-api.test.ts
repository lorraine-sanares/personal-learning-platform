import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { setAiClient, type AiClient } from "@/ai";

const FIXTURE_HTML = `<!DOCTYPE html>
<html>
  <head><title>Spaced Repetition Works</title></head>
  <body>
    <article>
      <h1>Spaced Repetition Works</h1>
      <p>Reviewing material at increasing intervals dramatically improves retention.
      The FSRS algorithm models memory stability and difficulty per item, scheduling
      each review just before the point of forgetting. This beats massed practice,
      where repeated cramming produces fast gains that decay within days.</p>
      <p>Research shows distributed practice is one of the most robust findings in
      cognitive psychology, replicated across decades of studies.</p>
    </article>
  </body>
</html>`;

const fakeAi: AiClient = {
  async extractInsights(text: string) {
    expect(text).toContain("increasing intervals");
    return [
      { content: "Spacing reviews at increasing intervals improves retention." },
      { content: "FSRS schedules each review just before the point of forgetting." },
    ];
  },
  async assignTheme() {
    return "Learning Science";
  },
};

let tempDir: string;
let fixtureServer: http.Server;
let fixtureUrl: string;
let api: typeof import("../app/api/sources/route");

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");

  fixtureServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(FIXTURE_HTML);
  });
  await new Promise<void>((resolve) => fixtureServer.listen(0, resolve));
  const address = fixtureServer.address();
  if (typeof address === "object" && address !== null) {
    fixtureUrl = `http://127.0.0.1:${address.port}/article`;
  }

  api = await import("../app/api/sources/route");
});

beforeEach(() => {
  setAiClient(fakeAi);
});

afterAll(() => {
  fixtureServer.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

function postSource(body: unknown): Promise<Response> {
  return api.POST(
    new Request("http://localhost/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("article Source ingestion", () => {
  it("ingests an article URL and returns the extracted Insight count", async () => {
    const response = await postSource({ type: "article", url: fixtureUrl });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sourceId).toBeGreaterThan(0);
    expect(body.insights).toHaveLength(2);
  });

  it("stores Insights as committed, each linked back to the Source", async () => {
    const response = await postSource({ type: "article", url: fixtureUrl });
    const body = await response.json();

    const { getDatabase } = await import("@/db");
    const database = getDatabase();

    const linkedInsights = database.sqlite
      .prepare(
        `SELECT i.content, i.state FROM insights i
         JOIN insight_sources s ON s.insight_id = i.id
         WHERE s.source_id = ?`,
      )
      .all(body.sourceId) as { content: string; state: string }[];

    expect(linkedInsights).toHaveLength(2);
    for (const insight of linkedInsights) {
      expect(insight.state).toBe("committed");
    }
    expect(linkedInsights.map((i) => i.content)).toContain(
      "FSRS schedules each review just before the point of forgetting.",
    );
  });

  it("assigns each Insight a Theme, reusing the Theme across ingests", async () => {
    await postSource({ type: "article", url: fixtureUrl });
    await postSource({ type: "article", url: fixtureUrl });

    const { getDatabase } = await import("@/db");
    const database = getDatabase();

    const themeRows = database.sqlite
      .prepare("SELECT id, name FROM themes WHERE name = 'Learning Science'")
      .all() as { id: number; name: string }[];
    expect(themeRows).toHaveLength(1);

    const unthemedInsights = database.sqlite
      .prepare(
        `SELECT i.id FROM insights i
         LEFT JOIN insight_themes t ON t.insight_id = i.id
         WHERE t.theme_id IS NULL`,
      )
      .all();
    expect(unthemedInsights).toHaveLength(0);
  });

  it("writes a vault .md file per Insight when a vault path is configured", async () => {
    const vaultDir = path.join(tempDir, "vault");
    fs.mkdirSync(vaultDir, { recursive: true });

    const { getDatabase } = await import("@/db");
    const { setSetting } = await import("@/settings");
    setSetting(getDatabase(), "vault_path", vaultDir);

    const response = await postSource({ type: "article", url: fixtureUrl });
    const body = await response.json();

    const insightFiles = fs.readdirSync(path.join(vaultDir, "Insights"));
    expect(insightFiles.length).toBe(body.insights.length);
    expect(insightFiles.every((f) => f.endsWith(".md"))).toBe(true);

    setSetting(getDatabase(), "vault_path", "");
  });

  it("returns 422 and stores nothing when the URL cannot be fetched", async () => {
    const { getDatabase } = await import("@/db");
    const database = getDatabase();
    const countBefore = database.sqlite
      .prepare("SELECT COUNT(*) AS n FROM sources")
      .get() as { n: number };

    const response = await postSource({
      type: "article",
      url: "http://127.0.0.1:9/unreachable",
    });

    expect(response.status).toBe(422);
    const countAfter = database.sqlite
      .prepare("SELECT COUNT(*) AS n FROM sources")
      .get() as { n: number };
    expect(countAfter.n).toBe(countBefore.n);
  });

  it("returns 400 for a malformed request body", async () => {
    const response = await postSource({ type: "article" });
    expect(response.status).toBe(400);
  });
});
