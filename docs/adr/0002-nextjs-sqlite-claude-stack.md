# ADR 0002: Next.js + SQLite + Claude API as V1 Stack

## Status
Accepted

## Context
V1 is a single-user web app running on desktop. It needs: a reactive UI, server-side API routes for AI processing and file handling, a local database, PDF/image parsing, EPUB generation, and spaced repetition scheduling. Multiple full-stack and database options were considered.

## Decision
- **Next.js** for frontend and API — one project, one deployment, strong AI app ecosystem.
- **SQLite via Drizzle ORM** for storage — zero server setup, appropriate for single-user V1, straightforward migration path to Postgres for V2 multi-user or cloud deployment.
- **Claude Sonnet 4.6** for heavy AI tasks (Insight extraction, Digest authoring, Card generation).
- **Claude Haiku 4.5** for fast, cheap classification tasks (Theme assignment, OCR post-processing).
- **ts-fsrs** for spaced repetition scheduling — drop-in TypeScript FSRS implementation.
- **epub-gen** for EPUB export — Node-native, no system binary dependencies.

## Consequences
- SQLite means the app runs fully offline and requires no database server in V1. The trade-off is that concurrent writes are not supported — acceptable for a single-user app.
- Two Claude models are used to balance cost and capability. Tasks that require reasoning use Sonnet; high-volume classification tasks use Haiku.
- Migrating from SQLite to Postgres in V2 will require a schema migration but no application logic changes, given Drizzle abstracts the dialect.
