import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tempDir: string;
let api: typeof import("../app/api/settings/route");

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "learning-platform-test-"));
  process.env.DB_PATH = path.join(tempDir, "test.db");
  api = await import("../app/api/settings/route");
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("settings API", () => {
  it("returns default settings", async () => {
    const response = await api.GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ daily_card_limit: "15", vault_path: "" });
  });

  it("updates settings and returns the new values", async () => {
    const request = new Request("http://localhost/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vault_path: "/tmp/my-vault", daily_card_limit: "20" }),
    });

    const response = await api.PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ daily_card_limit: "20", vault_path: "/tmp/my-vault" });

    const getBody = await (await api.GET()).json();
    expect(getBody).toEqual({ daily_card_limit: "20", vault_path: "/tmp/my-vault" });
  });

  it("rejects unknown setting keys", async () => {
    const request = new Request("http://localhost/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ not_a_real_setting: "x" }),
    });

    const response = await api.PUT(request);
    expect(response.status).toBe(400);
  });
});
