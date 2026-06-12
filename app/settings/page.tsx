"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [vaultPath, setVaultPath] = useState("");
  const [dailyCardLimit, setDailyCardLimit] = useState("15");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "saved">(
    "loading",
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((settings) => {
        setVaultPath(settings.vault_path ?? "");
        setDailyCardLimit(settings.daily_card_limit ?? "15");
        setStatus("ready");
      });
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vault_path: vaultPath,
        daily_card_limit: dailyCardLimit,
      }),
    });
    setStatus("saved");
  }

  if (status === "loading") {
    return <h2>Settings</h2>;
  }

  return (
    <>
      <h2>Settings</h2>
      <form className="settings-form" onSubmit={handleSave}>
        <label>
          Obsidian vault path
          <input
            type="text"
            value={vaultPath}
            onChange={(e) => {
              setVaultPath(e.target.value);
              setStatus("ready");
            }}
            placeholder="/Users/you/Documents/MyVault"
          />
          <span className="hint">
            Leave empty to disable vault sync. The app writes .md copies of
            Insights, Themes, and Cards here — edits made in Obsidian are
            overwritten on the next sync, so use a dedicated folder.
          </span>
        </label>
        <label>
          Daily card limit
          <input
            type="number"
            min="1"
            max="100"
            value={dailyCardLimit}
            onChange={(e) => {
              setDailyCardLimit(e.target.value);
              setStatus("ready");
            }}
          />
          <span className="hint">
            Maximum Cards per Review Session. Keep it small enough to stay a
            habit.
          </span>
        </label>
        <button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && <span className="save-status">Saved ✓</span>}
      </form>
    </>
  );
}
