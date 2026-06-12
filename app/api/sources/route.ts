import { NextResponse } from "next/server";
import { getDatabase } from "@/db";
import { sources, insights, insightSources, themes, insightThemes } from "@/db/schema";
import { getAiClient } from "@/ai";
import { fetchArticleText } from "@/ingestion/article";
import { syncToVault } from "@/vault-sync";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type !== "article" || typeof body.url !== "string") {
    return NextResponse.json(
      { error: "Expected { type: \"article\", url: string }" },
      { status: 400 },
    );
  }

  let article;
  try {
    article = await fetchArticleText(body.url);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Could not ingest this URL: ${error instanceof Error ? error.message : "unknown error"}`,
      },
      { status: 422 },
    );
  }

  const ai = getAiClient();
  const extracted = await ai.extractInsights(article.text);

  const database = getDatabase();
  const source = database.db
    .insert(sources)
    .values({ type: "article", contentRef: body.url })
    .returning()
    .get();

  const storedInsights = [];
  for (const item of extracted) {
    const insight = database.db
      .insert(insights)
      .values({ content: item.content, state: "committed" })
      .returning()
      .get();
    database.db
      .insert(insightSources)
      .values({ insightId: insight.id, sourceId: source.id })
      .run();

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

    storedInsights.push(insight);
  }

  return NextResponse.json({ sourceId: source.id, insights: storedInsights });
}
