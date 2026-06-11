import { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { fetchHtml } from "./fetch";
import { extractTmdbId } from "./parse";
import { logger } from "./logger";
import { ids } from "./db/schema";

const sqlite = new Database("cache/cache.sqlite", { strict: true });
const db = drizzle({ client: sqlite, casing: "snake_case" });
migrate(db, { migrationsFolder: "drizzle" });

export async function getTmdbId(letterboxdLink: string, sessionId: string): Promise<number | null> {
    const storedIds = await db.select().from(ids).where(eq(ids.letterboxdLink, letterboxdLink)).limit(1);

    if (storedIds[0] !== undefined) {
        logger.debug(`Film in cache (${letterboxdLink}) [tmdb:${storedIds[0].tmdbId}]`);
        return storedIds[0].tmdbId;
    }

    logger.debug(`Film not in cache (${letterboxdLink})`);

    const html = await fetchHtml(letterboxdLink, sessionId);
    const tmdbId = extractTmdbId(html);
    if (tmdbId !== null) {
        logger.success(`Found TMDB id for film (${letterboxdLink}) [tmdb:${tmdbId}]`);
        try {
            await db.insert(ids).values({ letterboxdLink: letterboxdLink, tmdbId: tmdbId });
        } catch (error) {
            logger.error(
                `Failed to insert into cache for film (${letterboxdLink}) [tmdb:${tmdbId}]`,
            );
        }
    } else {
        logger.fail(`Could not find TMDB id for film (${letterboxdLink})`);
    }

    return tmdbId;
}
