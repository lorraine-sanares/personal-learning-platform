# ADR 0001: Obsidian Vault as Sync Target, Not Primary Storage

## Status
Accepted

## Context
The user wants Insights, Themes, and Cards to appear in their Obsidian vault for browsing and linking. Two viable approaches: (1) use the vault's `.md` files as the primary database, or (2) maintain a dedicated app database and export a copy to the vault.

## Decision
The app maintains its own database as the authoritative source of truth. After each write, the system exports a `.md` representation to the Obsidian vault. The vault is a read-friendly, browsable copy — not the origin of data.

## Consequences
- The app can use a proper relational/document store optimised for querying (e.g. filtering Cards by due date, finding Insights by Theme) without being constrained by the `.md` file format.
- The Obsidian vault stays useful for manual browsing, linking, and graph exploration.
- Edits made inside Obsidian are not reflected back in the app. Users who edit vault files directly will have their changes overwritten on the next sync. Bi-directional sync is deferred to a future version.
