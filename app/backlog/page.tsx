"use client";

import { useCallback, useEffect, useState } from "react";

interface DraftInsight {
  id: number;
  content: string;
  sourceRefs: string[];
  createdAt: string;
}

interface Theme {
  id: number;
  name: string;
}

export default function BacklogPage() {
  const [drafts, setDrafts] = useState<DraftInsight[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [draftsRes, themesRes] = await Promise.all([
      fetch("/api/insights?state=draft"),
      fetch("/api/themes"),
    ]);
    setDrafts(await draftsRes.json());
    setThemes(await themesRes.json());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toggleTheme(insightId: number, themeId: number) {
    setSelected((prev) => {
      const current = prev[insightId] ?? [];
      return {
        ...prev,
        [insightId]: current.includes(themeId)
          ? current.filter((t) => t !== themeId)
          : [...current, themeId],
      };
    });
  }

  async function commit(insightId: number) {
    const themeIds = selected[insightId] ?? [];
    if (themeIds.length === 0) return;
    await fetch(`/api/insights/${insightId}/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeIds }),
    });
    refresh();
  }

  async function discard(insightId: number) {
    if (!window.confirm("Discard this Draft Insight? It will be deleted.")) return;
    await fetch(`/api/insights/${insightId}`, { method: "DELETE" });
    refresh();
  }

  if (!loaded) return <h2>Backlog</h2>;

  return (
    <>
      <h2>
        Backlog{" "}
        {drafts.length > 0 && <span className="count-badge">{drafts.length}</span>}
      </h2>

      {drafts.length === 0 ? (
        <p className="empty-state">
          Backlog is clear. Ambiguous Sources (images, voice memos) will queue
          their extracted Insights here for review.
        </p>
      ) : (
        <ul className="draft-list">
          {drafts.map((draft) => (
            <li key={draft.id} className="draft-item">
              <p className="draft-content">{draft.content}</p>
              <p className="draft-source">
                Source: {draft.sourceRefs.join(", ") || "unknown"}
              </p>
              <div className="theme-picker">
                {themes.length === 0 ? (
                  <span className="hint">
                    Create a Theme first to commit this Insight.
                  </span>
                ) : (
                  themes.map((theme) => (
                    <label key={theme.id} className="theme-checkbox">
                      <input
                        type="checkbox"
                        checked={(selected[draft.id] ?? []).includes(theme.id)}
                        onChange={() => toggleTheme(draft.id, theme.id)}
                      />
                      {theme.name}
                    </label>
                  ))
                )}
              </div>
              <div className="draft-actions">
                <button
                  onClick={() => commit(draft.id)}
                  disabled={(selected[draft.id] ?? []).length === 0}
                >
                  Commit
                </button>
                <button className="secondary" onClick={() => discard(draft.id)}>
                  Discard
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
