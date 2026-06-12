"use client";

import { useState } from "react";

type SourceType = "article" | "pdf" | "image";

export default function IngestPage() {
  const [sourceType, setSourceType] = useState<SourceType>("article");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("processing");
    setMessage("");

    let response: Response;
    if (sourceType === "article") {
      response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "article", url }),
      });
    } else {
      if (!file) return;
      const formData = new FormData();
      formData.append("type", sourceType);
      formData.append("file", file);
      response = await fetch("/api/sources", { method: "POST", body: formData });
    }
    const body = await response.json();

    if (response.ok) {
      setStatus("done");
      const count = body.insights.length;
      const isDraft = body.insights.every(
        (i: { state: string }) => i.state === "draft",
      );
      setMessage(
        isDraft
          ? `${count} Draft Insight${count === 1 ? "" : "s"} created — review them in the Backlog.`
          : `${count} Insight${count === 1 ? "" : "s"} extracted and committed.`,
      );
      setUrl("");
      setFile(null);
    } else {
      setStatus("error");
      setMessage(body.error ?? "Something went wrong.");
    }
  }

  return (
    <>
      <h2>Ingest a Source</h2>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          Source type
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
          >
            <option value="article">Article (URL)</option>
            <option value="pdf">PDF (upload)</option>
            <option value="image">Image / photo (upload)</option>
          </select>
        </label>

        {sourceType === "article" ? (
          <label>
            Article URL
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
            <span className="hint">
              Paste a link to an article. The content is fetched, Insights are
              extracted by Claude, and each one is filed under a Theme.
            </span>
          </label>
        ) : sourceType === "pdf" ? (
          <label>
            PDF file
            <input
              type="file"
              required
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="hint">
              Upload a PDF document. Its text is parsed server-side and
              Insights are extracted by Claude.
            </span>
          </label>
        ) : (
          <label>
            Image file
            <input
              type="file"
              required
              accept="image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span className="hint">
              Photo of handwriting or printed text. OCR transcribes it, then
              Insights are extracted as Drafts for you to review in the
              Backlog.
            </span>
          </label>
        )}

        <button type="submit" disabled={status === "processing"}>
          {status === "processing" ? "Extracting…" : "Ingest"}
        </button>
        {status === "done" && <span className="save-status">{message}</span>}
        {status === "error" && (
          <span className="save-status" style={{ color: "#c62828" }}>
            {message}
          </span>
        )}
      </form>
    </>
  );
}
