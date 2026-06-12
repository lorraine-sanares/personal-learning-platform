import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { insights, insightThemes } from "@/db/schema";
import { syncToVault } from "@/vault-sync";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const insightId = Number(id);
  const body = await request.json();
  const themeIds: number[] = Array.isArray(body.themeIds) ? body.themeIds : [];

  if (themeIds.length === 0) {
    return NextResponse.json(
      { error: "Assign at least one Theme to commit an Insight" },
      { status: 400 },
    );
  }

  const database = getDatabase();
  const insight = database.db
    .select()
    .from(insights)
    .where(eq(insights.id, insightId))
    .get();

  if (!insight) {
    return NextResponse.json({ error: "Insight not found" }, { status: 404 });
  }

  for (const themeId of themeIds) {
    database.db
      .insert(insightThemes)
      .values({ insightId, themeId })
      .onConflictDoNothing()
      .run();
  }

  const committed = database.db
    .update(insights)
    .set({ state: "committed" })
    .where(eq(insights.id, insightId))
    .returning()
    .get();

  syncToVault(database, {
    kind: "insight",
    id: committed.id,
    title: committed.content.slice(0, 60),
    body: committed.content,
  });

  return NextResponse.json(committed);
}
