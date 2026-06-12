import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { insights } from "@/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const insightId = Number(id);
  const database = getDatabase();

  const existing = database.db
    .select()
    .from(insights)
    .where(eq(insights.id, insightId))
    .get();
  if (!existing) {
    return NextResponse.json({ error: "Insight not found" }, { status: 404 });
  }

  database.db.delete(insights).where(eq(insights.id, insightId)).run();
  return NextResponse.json({ deleted: true });
}
