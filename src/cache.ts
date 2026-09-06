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

    let html: string;
    try {
        html = await fetchHtml(letterboxdLink, sessionId);
    } catch (error) {
        // A single film failing to fetch (e.g. a slow Cloudflare challenge
        // timing out) must not kill the rest of the list - skip this one
        // film and let the caller move on to the next.
        logger.error(
            `Skipping film (${letterboxdLink}) after fetch failure: ${(error as Error).message}`,
        );
        return null;
    }
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
