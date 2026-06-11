import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const ids = sqliteTable("ids", {
    letterboxdLink: text().primaryKey(),
    tmdbId: integer().notNull(),
});
