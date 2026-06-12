import { getDatabase } from "@/db";
import { sources, insights, insightSources, themes, insightThemes } from "@/db/schema";
import { getAiClient } from "@/ai";
import { syncToVault } from "@/vault-sync";

export interface IngestInput {
  sourceType: "pdf" | "article" | "meeting_note" | "workspace_page" | "image";
  contentRef: string;
  text: string;
  /** Draft Insights (e.g. from OCR) wait in the Backlog; committed ones are live immediately. */
  insightState: "draft" | "committed";
}

export interface IngestResult {
  sourceId: number;
  insights: { id: number; content: string; state: string }[];
}

export async function ingestText(input: IngestInput): Promise<IngestResult> {
  const ai = getAiClient();
  const extracted = await ai.extractInsights(input.text);

  const database = getDatabase();
  const source = database.db
    .insert(sources)
    .values({ type: input.sourceType, contentRef: input.contentRef })
    .returning()
    .get();

  const storedInsights = [];
  for (const item of extracted) {
    const insight = database.db
      .insert(insights)
      .values({ content: item.content, state: input.insightState })
      .returning()
      .get();
    database.db
      .insert(insightSources)
      .values({ insightId: insight.id, sourceId: source.id })
      .run();

    // Draft Insights get their Theme assigned by the user in the Backlog.
    if (input.insightState === "committed") {
      const existingThemes = database.db.select().from(themes).all();
      const themeName = await ai.assignTheme(
        item.content,
        existingThemes.map((t) => t.name),
      );
      const theme =
        existingThemes.find(
          (t) => t.name.toLowerCase() === themeName.toLowerCase(),
        ) ??
        database.db
          .insert(themes)
          .values({ name: themeName, status: "committed" })
          .returning()
          .get();
      database.db
        .insert(insightThemes)
        .values({ insightId: insight.id, themeId: theme.id })
        .run();

      syncToVault(database, {
        kind: "insight",
        id: insight.id,
        title: insight.content.slice(0, 60),
        body: insight.content,
      });
    }

    storedInsights.push(insight);
  }

  return { sourceId: source.id, insights: storedInsights };
}
