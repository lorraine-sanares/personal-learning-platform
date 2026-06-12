import fs from "node:fs";
import path from "node:path";
import type { AppDatabase } from "./db/client";
import { getSetting } from "./settings";

export interface VaultEntity {
  kind: "insight" | "theme" | "card";
  id: number;
  title: string;
  body: string;
}

const KIND_FOLDERS: Record<VaultEntity["kind"], string> = {
  insight: "Insights",
  theme: "Themes",
  card: "Cards",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function syncToVault(
  database: AppDatabase,
  entity: VaultEntity,
): string | null {
  const vaultPath = getSetting(database, "vault_path");
  if (!vaultPath) {
    return null;
  }

  const folder = path.join(vaultPath, KIND_FOLDERS[entity.kind]);
  fs.mkdirSync(folder, { recursive: true });

  const filePath = path.join(folder, `${slugify(entity.title)}-${entity.id}.md`);
  const content = [
    "---",
    `id: ${entity.id}`,
    `kind: ${entity.kind}`,
    "---",
    "",
    `# ${entity.title}`,
    "",
    entity.body,
    "",
  ].join("\n");

  fs.writeFileSync(filePath, content);
  return filePath;
}
