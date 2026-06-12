import { NextResponse } from "next/server";
import { getDatabase } from "@/db";
import { themes, themeRelationships, insightThemes } from "@/db/schema";

export async function GET() {
  const database = getDatabase();
  const allThemes = database.db.select().from(themes).all();
  const relationships = database.db.select().from(themeRelationships).all();
  const links = database.db.select().from(insightThemes).all();

  const result = allThemes.map((theme) => ({
    ...theme,
    relatedThemeIds: relationships
      .filter((r) => r.themeId === theme.id || r.relatedThemeId === theme.id)
      .map((r) => (r.themeId === theme.id ? r.relatedThemeId : r.themeId)),
    insightCount: links.filter((l) => l.themeId === theme.id).length,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Theme name must not be empty" },
      { status: 400 },
    );
  }

  const database = getDatabase();
  const theme = database.db
    .insert(themes)
    .values({ name, status: "committed" })
    .returning()
    .get();

  return NextResponse.json(theme);
}
