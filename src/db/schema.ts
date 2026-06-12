import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", {
    enum: ["pdf", "article", "meeting_note", "workspace_page", "image"],
  }).notNull(),
  contentRef: text("content_ref").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const insights = sqliteTable("insights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  state: text("state", { enum: ["draft", "committed"] }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const insightSources = sqliteTable(
  "insight_sources",
  {
    insightId: integer("insight_id")
      .notNull()
      .references(() => insights.id, { onDelete: "cascade" }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.insightId, table.sourceId] })],
);

export const themes = sqliteTable("themes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["proposed", "committed"] }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const insightThemes = sqliteTable(
  "insight_themes",
  {
    insightId: integer("insight_id")
      .notNull()
      .references(() => insights.id, { onDelete: "cascade" }),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.insightId, table.themeId] })],
);

export const themeRelationships = sqliteTable(
  "theme_relationships",
  {
    themeId: integer("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
    relatedThemeId: integer("related_theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.themeId, table.relatedThemeId] })],
);

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  insightId: integer("insight_id")
    .notNull()
    .references(() => insights.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  stability: real("stability").notNull(),
  difficulty: real("difficulty").notNull(),
  dueDate: text("due_date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const digests = sqliteTable("digests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  contentJson: text("content_json").notNull(),
  epubPath: text("epub_path"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const perspectives = sqliteTable("perspectives", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prompt: text("prompt").notNull(),
  response: text("response"),
  status: text("status", {
    enum: ["pending", "answered", "deferred"],
  }).notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const perspectiveThemes = sqliteTable(
  "perspective_themes",
  {
    perspectiveId: integer("perspective_id")
      .notNull()
      .references(() => perspectives.id, { onDelete: "cascade" }),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.perspectiveId, table.themeId] })],
);

export const userSettings = sqliteTable("user_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
