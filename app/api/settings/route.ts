import { NextResponse } from "next/server";
import { getDatabase } from "@/db";
import { DEFAULT_SETTINGS, getSetting, setSetting } from "@/settings";

function allSettings() {
  const database = getDatabase();
  return Object.fromEntries(
    Object.keys(DEFAULT_SETTINGS).map((key) => [key, getSetting(database, key)]),
  );
}

export async function GET() {
  return NextResponse.json(allSettings());
}

export async function PUT(request: Request) {
  const updates: Record<string, string> = await request.json();

  const unknownKeys = Object.keys(updates).filter(
    (key) => !(key in DEFAULT_SETTINGS),
  );
  if (unknownKeys.length > 0) {
    return NextResponse.json(
      { error: `Unknown settings: ${unknownKeys.join(", ")}` },
      { status: 400 },
    );
  }

  const database = getDatabase();
  for (const [key, value] of Object.entries(updates)) {
    setSetting(database, key, String(value));
  }

  return NextResponse.json(allSettings());
}
