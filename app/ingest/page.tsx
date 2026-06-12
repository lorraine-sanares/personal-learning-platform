"use client";

import { useState } from "react";

export default function IngestPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("processing");
    setMessage("");

    const response = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "article", url }),
    });
    const body = await response.json();

    if (response.ok) {
      setStatus("done");
      setMessage(
        `${body.insights.length} Insight${body.insights.length === 1 ? "" : "s"} extracted and committed.`,
      );
      setUrl("");
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
