import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { themes, themeRelationships } from "@/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const themeId = Number(id);
  const body = await request.json();
  const database = getDatabase();

  const existing = database.db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .get();
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Theme name must not be empty" },
        { status: 400 },
      );
    }
    database.db
      .update(themes)
      .set({ name })
      .where(eq(themes.id, themeId))
      .run();
  }

  if (typeof body.addRelatedThemeId === "number") {
    database.db
      .insert(themeRelationships)
      .values({ themeId, relatedThemeId: body.addRelatedThemeId })
      .onConflictDoNothing()
      .run();
  }

  const updated = database.db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .get();
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const themeId = Number(id);
  const database = getDatabase();

  const existing = database.db
    .select()
    .from(themes)
    .where(eq(themes.id, themeId))
    .get();
  if (!existing) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  database.db.delete(themes).where(eq(themes.id, themeId)).run();
  return NextResponse.json({ deleted: true });
}
