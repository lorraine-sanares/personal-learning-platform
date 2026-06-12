# PRD: Personal Learning Platform — V1

## Problem Statement

I consume a large volume of material across formats — PDFs, articles, meeting notes, handwritten images, and workspace pages — but the knowledge I gain from them is fragmented across tools and fades quickly. There is no single place where my extracted understanding lives, connects, and resurfaces in a way that builds long-term retention. I want a personal knowledge system that turns my raw inputs into durable, reviewable knowledge without requiring me to manually organise everything.

## Solution

A single-user web app that ingests Sources in multiple formats, uses AI to extract Insights, organises them into Themes, generates a daily Digest, and drives spaced repetition review via Cards. A Knowledge Graph gives a bird's-eye view of how Themes and Insights connect. A Perspectives Tab captures my evolving opinions. Everything syncs downstream to an Obsidian vault for free-form browsing.

## User Stories

### Source Ingestion
1. As a user, I want to upload a PDF as a Source, so that Insights are extracted from its content automatically.
2. As a user, I want to paste a URL as a Source, so that the article's content is fetched and processed without me copying it manually.
3. As a user, I want to import a meeting note from Apple Notes or OneNote as a Source, so that decisions and ideas from meetings become part of my knowledge base.
4. As a user, I want to import a page from Notion or Obsidian as a Source, so that my existing workspace content feeds into the system.
5. As a user, I want to upload a photo of handwriting or printed text as a Source, so that physical notes are captured via OCR and turned into Insights.
6. As a user, I want to see a confirmation when a Source has been ingested and Insights extracted, so that I know the processing completed successfully.
7. As a user, I want to see which Sources each Insight was derived from, so that I can trace knowledge back to its origin.

### Insights and Backlog
8. As a user, I want Insights extracted from high-confidence Sources to be committed to my knowledge base immediately, so that clear material is available without manual intervention.
9. As a user, I want ambiguous Sources (voice memos, rough images, unstructured notes) to produce Draft Insights, so that I can review uncertain extractions before they enter my knowledge base.
10. As a user, I want to see all Draft Insights in a Backlog, so that I have a single queue of items awaiting my attention.
11. As a user, I want to assign a Draft Insight to one or more Themes in the Backlog, so that it becomes Committed and part of my active knowledge base.
12. As a user, I want to discard a Draft Insight from the Backlog, so that low-quality extractions do not pollute my knowledge base.
13. As a user, I want to see how many Draft Insights are pending in the Backlog, so that I know how much triage work is queued.

### Themes
14. As a user, I want to seed an initial set of broad Themes manually, so that the system has a starting taxonomy to classify Insights into.
15. As a user, I want the AI to propose new granular Themes when enough Insights cluster around a topic with no existing home, so that my taxonomy evolves without requiring me to anticipate every topic.
16. As a user, I want to approve or rename a proposed Theme before it is committed, so that the taxonomy reflects my own language and mental model.
17. As a user, I want to see which Themes an Insight belongs to, so that I understand how a piece of knowledge fits into my broader knowledge base.
18. As a user, I want Themes to connect to one another where overlap exists, so that related areas of my knowledge base are linked.

### Knowledge Graph
19. As a user, I want to view my Themes and their relationships as a visual graph, so that I can see a bird's-eye view of my entire knowledge base.
20. As a user, I want to navigate the graph by clicking on a Theme node, so that I can explore connected Themes and their Insights.
21. As a user, I want the Knowledge Graph to update automatically as new Insights and Themes are committed, so that it always reflects my current knowledge base.

### Cards and Spaced Repetition
22. As a user, I want Cards (question-answer pairs) generated automatically from each committed Insight, so that I have review material without writing flashcards manually.
23. As a user, I want multiple Cards to be generated from a single Insight where appropriate, so that different facets of an Insight are each tested separately.
24. As a user, I want Cards to be scheduled using the FSRS algorithm, so that I review them at the optimal interval for long-term retention.
25. As a user, I want to see the question on a Card before the answer is revealed, so that the recall attempt is genuine.
26. As a user, I want to self-rate each Card as Again / Hard / Good / Easy after seeing the answer, so that the scheduling algorithm can adapt to how well I know the material.
27. As a user, I want the Card's next review date to update immediately after I rate it, so that my Review Queue is always current.

### Review Session
28. As a user, I want a daily Review Session that presents Cards due for review per the FSRS schedule, so that I stay on top of retention without manually selecting what to review.
29. As a user, I want the Review Session to also include Cards generated from that day's Digest Insights, so that new knowledge is reinforced the same day I encounter it.
30. As a user, I want the Review Queue to be bounded by a configurable Daily Card Limit, so that review load never accumulates into an overwhelming backlog.
31. As a user, I want Cards closest to being forgotten (highest FSRS retention risk) to appear first in a Review Session, so that the most at-risk knowledge is prioritised.
32. As a user, I want to see my progress through a Review Session (e.g. "5 of 12 cards"), so that I know how much is left.
33. As a user, I want to end a Review Session early, so that I am not forced to complete it if I run out of time.

### Digest
34. As a user, I want a Digest generated each morning containing Insights from Sources ingested the previous day, so that my daily reading material is pre-prepared without manual effort.
35. As a user, I want the Digest to include Related Content — web and news articles thematically relevant to my recently ingested Sources — so that I am exposed to connected ideas I did not manually find.
36. As a user, I want the Digest to show a stats header ("X Insights across Y Themes"), so that I get an at-a-glance summary before reading.
37. As a user, I want each Insight in the Digest rendered as a styled summary card with a headline, 2-line summary, and Theme tag, so that I can skim quickly.
38. As a user, I want og:image thumbnails pulled from article Sources in the Digest, so that the reading experience is visually rich.
39. As a user, I want the Digest exported as an EPUB to my Kindle, so that I can read it on dedicated reading hardware away from a screen.
40. As a user, I want to read past Digests inside the app via the Digest Consumption Mode, so that I can revisit previous days' material without needing my Kindle.

### Insights Dashboard
41. As a user, I want to switch between Consumption Modes (Snack, Recent, Digest, Deep Dive) in the Insights Dashboard, so that I can consume my knowledge base in the way that fits my current context.
42. As a user, I want the Snack mode to show a single Insight or short summary, so that I can get value from the app in a spare minute.
43. As a user, I want the Recent mode to show a reverse-chronological feed of newly committed Insights, so that I can catch up on what was extracted recently.
44. As a user, I want the Deep Dive mode to show the full context of a single Insight — parent Themes, related Insights, and source links — so that I can explore a topic in full detail.

### Knowledge Context Panel
45. As a user, I want a Knowledge Context Panel available while reading any Insight, so that I can see related context without leaving the reading surface.
46. As a user, I want the Knowledge Context Panel to be collapsed by default, so that it does not interrupt the reading experience.
47. As a user, I want to open and close the Knowledge Context Panel with a single click, so that accessing context is frictionless.
48. As a user, I want the panel to show the Themes this Insight belongs to, semantically related Insights, and a mini Knowledge Graph centred on this Insight, so that I can understand the Insight's place in my knowledge base at a glance.

### Perspectives
49. As a user, I want the app to present Reflection Prompts asking for my opinion on topics I have been engaging with, so that I am nudged to form and articulate my own views.
50. As a user, I want to respond to a Reflection Prompt with a Perspective, so that my evolving opinions are captured alongside the factual Insights in my knowledge base.
51. As a user, I want to defer responding to a Reflection Prompt, so that I am not forced to answer immediately.
52. As a user, I want my Perspectives displayed in the Perspectives Tab organised by Theme, so that I can see which topics my opinions cluster around.
53. As a user, I want to see how my Perspective on a topic has shifted over time as my knowledge base grows, so that I can observe my own intellectual evolution.
54. As a user, I want each Perspective linked to the Insights and Sources that informed it, so that I can trace the evidence behind my opinions.

### Explore View
55. As a user, I want a dedicated Explore View for navigating my knowledge base without a fixed agenda, so that I can browse and discover connections freely.
56. As a user, I want to browse Themes and traverse the Knowledge Graph in Explore View, so that I can follow threads of interest wherever they lead.
57. As a user, I want Explore to be scoped entirely to my own vault, so that it does not retrieve external content during free-form exploration.

### Obsidian Vault Sync
58. As a user, I want every committed Insight, Theme, and Card exported as a `.md` file to my Obsidian vault after each write, so that I can browse and link my knowledge base inside Obsidian.
59. As a user, I want the app database to remain the authoritative source of truth, so that Obsidian is a read-friendly copy rather than a sync conflict risk.

## Implementation Decisions

- **Next.js full-stack** handles both the UI and all API routes in a single project. No separate backend service.
- **SQLite via Drizzle ORM** is the primary database for V1. Single-user, no server setup. Drizzle's dialect abstraction means a migration to Postgres for V2 requires only a schema migration, not application logic changes.
- **Two Claude models** are used to balance cost and capability: Claude Sonnet 4.6 for heavy reasoning tasks (Insight extraction, Digest authoring, Card generation, Reflection Prompt generation); Claude Haiku 4.5 for high-volume, cheap classification tasks (Theme assignment, OCR post-structuring). See ADR-0002.
- **ts-fsrs** handles all spaced repetition scheduling. Each Card row stores `stability`, `difficulty`, and `due_date` fields maintained by ts-fsrs after each rating event.
- **Daily Card Limit** is a configurable integer stored in user settings. The Review Queue selection query filters to Cards with `due_date <= today`, ordered by ascending retention probability, capped at this limit.
- **Digest generation** runs on a daily schedule (server-side cron or Next.js scheduled function). It queries all Insights committed in the previous calendar day, calls Claude Sonnet 4.6 to author the document, fetches Related Content via a web search, and writes the output to the Digest table. EPUB generation via epub-gen runs as part of the same job.
- **Related Content** is AI-sourced via web search during Digest generation. It is stored as read-only records linked to the Digest; it does not automatically produce Insights unless the user explicitly ingests the article as a Source.
- **Obsidian vault sync** writes `.md` files after every database write (new Insight, Theme, Card). The vault path is user-configured. Sync is append/overwrite only — edits inside Obsidian are not reflected back. See ADR-0001.
- **PDF parsing** uses pdf-parse server-side in Next.js API routes. Image OCR uses Tesseract.js server-side. Both run as part of the Source ingestion pipeline before the Claude extraction call.
- **Theme proposal flow**: the system periodically clusters uncommitted Insights by semantic similarity and compares against existing Themes. When a cluster exceeds a configurable threshold with no existing Theme home, a proposed Theme record is written with `status: proposed`. The user approves or renames it before it becomes `status: committed`.
- **Perspectives** are authored in response to Reflection Prompts. Prompts are generated by Claude based on the user's Theme engagement history and the most recent Digest. A Prompt record is stored with `status: pending` until the user responds (→ `status: answered`) or defers (→ `status: deferred`).

## Testing Decisions

**What makes a good test:** tests should exercise external behaviour observable at an API or module boundary — not internal implementation details. A good test calls an API route with a realistic input and asserts on the database state or response body. It does not assert on which internal functions were called or mock Claude responses unless testing error-handling paths specifically.

**Seams to test:**

1. **Source ingestion API route** (`POST /api/sources`) — submit a Source payload (URL, PDF, text) and assert that one or more Insight records appear in the database with correct `state` (Committed or Draft depending on input type). This is the highest available seam and covers the full pipeline including AI extraction.

2. **Backlog resolution** (`POST /api/insights/:id/commit`) — given a Draft Insight, call the commit endpoint with a Theme assignment and assert the Insight's `state` transitions to Committed and the Theme association is recorded.

3. **Card generation** — after an Insight is committed, assert that one or more Card records exist with valid FSRS fields (`stability > 0`, `difficulty` within range, `due_date` set). Since Card generation is triggered by Insight commit, this can be tested as part of the Backlog resolution flow.

4. **Review Session rating** (`POST /api/cards/:id/rate`) — submit a rating (Again / Hard / Good / Easy) for a Card and assert that `due_date` advances correctly. ts-fsrs is deterministic given fixed inputs, so expected values can be computed and asserted without mocking.

5. **Digest generation job** — invoke the Digest generation function directly and assert the output Digest record has: a non-empty stats header, at least one Insight summary, and a valid EPUB binary attached. Use a seeded set of Insights in the test database to make the assertion deterministic.

6. **Obsidian vault sync** — after committing an Insight, assert that a corresponding `.md` file is written to the configured vault path with the correct filename and content structure.

**Prior art:** no existing tests in the codebase yet. The first tests written should establish the integration test pattern (real SQLite test database, real Next.js API route handler calls) that subsequent tests follow.

## Out of Scope

- Bi-directional Obsidian sync (edits in Obsidian flowing back to the app) — deferred to a future version per ADR-0001.
- Passive Source ingestion (email forwarding, calendar sync, mobile capture) — logged for V2+.
- Multi-user support — V1 is single-user only; Postgres migration and auth are V2 concerns.
- Native desktop app (Mac) — V2 roadmap item.
- Native iOS app — V3 roadmap item.
- Web search or external content in Explore View — Explore is scoped to the user's own vault only.
- Automatic Insight generation from Related Content — Related Content is read-only in V1; the user must explicitly ingest an article as a Source.

## Further Notes

- The FSRS algorithm replaces the older SM-2 algorithm used by Anki. ts-fsrs is a drop-in TypeScript implementation that handles all scheduling maths; the application layer only needs to store the three state fields per Card and pass ratings through the library.
- The Daily Card Limit is intentionally small (suggested default: 15) to keep review load sustainable. The design philosophy is that a short daily habit is better than an overwhelming backlog that users abandon.
- Reflection Prompts are the primary surface for the agent to make topic recommendations. The agent uses Theme engagement history (which Themes the user has been reading, reviewing, and writing Perspectives on) to decide what to ask next — this is preferable to an explicit "recommend topics" UI because it surfaces recommendations in a conversational, low-friction way.
- V1 targets desktop browser only. The responsive web design should be mobile-aware but the primary viewport is desktop.
