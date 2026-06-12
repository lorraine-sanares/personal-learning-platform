import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setAiClient, type AiClient } from "@/ai";

// Minimal valid single-page PDF with a text stream.
function buildPdf(text: string): Buffer {
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

const fakeAi: AiClient = {
  async extractInsights(text: string) {
    expect(text).toContain("Spaced repetition strengthens memory");
    return [{ content: "Spaced repetition strengthens long-term memory." }];
  },
  async assignTheme() {
    return "Learning Science";
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
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("PDF Source ingestion", () => {
  it("ingests an uploaded PDF and stores committed Insights", async () => {
    const pdfBuffer = buildPdf("Spaced repetition strengthens memory over time");
    const formData = new FormData();
    formData.append("type", "pdf");
    formData.append(
      "file",
      new File([new Uint8Array(pdfBuffer)], "notes.pdf", { type: "application/pdf" }),
    );

    const response = await api.POST(
      new Request("http://localhost/api/sources", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.insights).toHaveLength(1);

    const { getDatabase } = await import("@/db");
    const database = getDatabase();
    const source = database.sqlite
      .prepare("SELECT type, content_ref FROM sources WHERE id = ?")
      .get(body.sourceId) as { type: string; content_ref: string };
    expect(source.type).toBe("pdf");
    expect(source.content_ref).toBe("notes.pdf");
  });

  it("rejects a non-PDF upload claiming to be a PDF", async () => {
    const formData = new FormData();
    formData.append("type", "pdf");
    formData.append(
      "file",
      new File([new TextEncoder().encode("not a pdf at all")], "fake.pdf", {
        type: "application/pdf",
      }),
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
