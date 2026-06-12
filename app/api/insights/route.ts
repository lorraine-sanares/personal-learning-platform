import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { insights, insightSources, sources, insightThemes, themes } from "@/db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const database = getDatabase();

  const baseQuery = database.db.select().from(insights).orderBy(desc(insights.createdAt));
  const rows =
    state === "draft" || state === "committed"
      ? baseQuery.where(eq(insights.state, state)).all()
      : baseQuery.all();

  const sourceLinks = database.db
    .select({
      insightId: insightSources.insightId,
      contentRef: sources.contentRef,
      sourceType: sources.type,
    })
    .from(insightSources)
    .innerJoin(sources, eq(insightSources.sourceId, sources.id))
    .all();

  const themeLinks = database.db
    .select({
      insightId: insightThemes.insightId,
      themeId: insightThemes.themeId,
      themeName: themes.name,
    })
    .from(insightThemes)
    .innerJoin(themes, eq(insightThemes.themeId, themes.id))
    .all();

  const result = rows.map((insight) => ({
    ...insight,
    sourceRefs: sourceLinks
      .filter((l) => l.insightId === insight.id)
      .map((l) => l.contentRef),
    themes: themeLinks
      .filter((l) => l.insightId === insight.id)
      .map((l) => ({ id: l.themeId, name: l.themeName })),
  }));

  return NextResponse.json(result);
}
