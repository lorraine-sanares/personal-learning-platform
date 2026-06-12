"use client";

import { useCallback, useEffect, useState } from "react";

interface Theme {
  id: number;
  name: string;
  status: string;
  relatedThemeIds: number[];
  insightCount: number;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [newName, setNewName] = useState("");
  const [linkSource, setLinkSource] = useState<number | "">("");
  const [linkTarget, setLinkTarget] = useState<number | "">("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/themes");
    setThemes(await response.json());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createTheme(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    refresh();
  }

  async function renameTheme(theme: Theme) {
    const name = window.prompt("New name for this Theme:", theme.name);
    if (!name || name.trim() === theme.name) return;
    await fetch(`/api/themes/${theme.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    refresh();
  }

  async function deleteTheme(theme: Theme) {
    const confirmed = window.confirm(
      `Delete "${theme.name}"? Its ${theme.insightCount} linked Insight(s) will become unthemed but are not deleted.`,
    );
    if (!confirmed) return;
    await fetch(`/api/themes/${theme.id}`, { method: "DELETE" });
    refresh();
  }

  async function linkThemes(event: React.FormEvent) {
    event.preventDefault();
    if (linkSource === "" || linkTarget === "" || linkSource === linkTarget)
      return;
    await fetch(`/api/themes/${linkSource}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addRelatedThemeId: linkTarget }),
    });
    setLinkSource("");
    setLinkTarget("");
    refresh();
  }

  const themeName = (id: number) =>
    themes.find((t) => t.id === id)?.name ?? `#${id}`;

  return (
    <>
      <h2>Themes</h2>

      <form className="settings-form" onSubmit={createTheme}>
        <label>
          New Theme
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Machine Learning"
          />
        </label>
        <button type="submit">Create</button>
      </form>

      {themes.length === 0 ? (
        <p className="empty-state">
          No Themes yet. Seed a few broad topics to organise your Insights.
        </p>
      ) : (
        <ul className="theme-list">
          {themes.map((theme) => (
            <li key={theme.id} className="theme-item">
              <span className="theme-name">
                {theme.name}
                {theme.status === "proposed" && (
                  <em className="proposed-badge"> (proposed)</em>
                )}
              </span>
              <span className="theme-meta">
                {theme.insightCount} insight{theme.insightCount === 1 ? "" : "s"}
                {theme.relatedThemeIds.length > 0 && (
                  <>
                    {" "}
                    · related: {theme.relatedThemeIds.map(themeName).join(", ")}
                  </>
                )}
              </span>
              <span className="theme-actions">
                <button onClick={() => renameTheme(theme)}>Rename</button>
                <button onClick={() => deleteTheme(theme)}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {themes.length >= 2 && (
        <form className="settings-form link-form" onSubmit={linkThemes}>
          <label>
            Link related Themes
            <span className="hint">
              Connections appear in the Knowledge Graph.
            </span>
          </label>
          <div className="link-row">
            <select
              value={linkSource}
              onChange={(e) => setLinkSource(Number(e.target.value))}
            >
              <option value="">Select theme…</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <span>↔</span>
            <select
              value={linkTarget}
              onChange={(e) => setLinkTarget(Number(e.target.value))}
            >
              <option value="">Select theme…</option>
              {themes
                .filter((t) => t.id !== linkSource)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
            <button type="submit">Link</button>
          </div>
        </form>
      )}
    </>
  );
}
