import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const grammarLessons = sqliteTable(
  "grammar_lessons",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: text("owner_id").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    schoolBand: text("school_band").notNull().default("중학교"),
    domain: text("domain").notNull(),
    curriculumCode: text("curriculum_code").notNull().default(""),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    contentJson: text("content_json").notNull().default("{}"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_grammar_lessons_slug").on(table.slug),
    index("idx_grammar_lessons_status_published").on(table.status, table.publishedAt),
    index("idx_grammar_lessons_owner_updated").on(table.ownerId, table.updatedAt),
  ],
);
