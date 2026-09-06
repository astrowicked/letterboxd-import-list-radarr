import { getTmdbId } from "./cache";
import { createSession, destroySession, fetchHtml } from "./fetch";
import { logger } from "./logger";
import { getFilmsOnPage, getNumberOfPages } from "./parse";
import type { ImportListItem } from "./types";
import "./cron";

const server = Bun.serve({
    hostname: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
    development: process.env.NODE_ENV !== "production",
    port: process.env.NODE_ENV === "production" ? 80 : 3000,
    idleTimeout: 60,
    fetch: handleRequest,
    error(error) {
        logger.error(error.message);
        return new Response(`Internal error: ${error.message}`, { status: 500 });
    },
});

logger.info(`Listening on http://${server.hostname}:${server.port}`);

async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    logger.info(`${req.method} ${path}`);

    const sessionId = `lilr${path}`;
    logger.info(`Creating FlareSolverr session ${sessionId}`);
    await createSession(sessionId);

    const importList: ImportListItem[] = [];

    // Any failure below (a slow Cloudflare challenge on a page or a film) used
    // to throw uncaught and skip straight past destroySession, leaking the
    // session across retries and silently killing the rest of the scrape.
    // try/finally guarantees cleanup runs either way; individual page/film
    // failures are caught below so one bad page/film just gets skipped.
    try {
        const html = await fetchHtml(path, sessionId);
        const numberOfPages = getNumberOfPages(html);
        logger.debug(`List ${path} has ${numberOfPages} page(s)`);

        for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
            const pagePath = pageNumber === 1 ? path : `${path}/page/${pageNumber}/`;
            logger.info(`Fetching films on ${pagePath}`);

            let pageHtml: string;
            try {
                pageHtml = pageNumber === 1 ? html : await fetchHtml(pagePath, sessionId);
            } catch (error) {
                logger.error(`Skipping page (${pagePath}) after fetch failure: ${(error as Error).message}`);
                continue;
            }

            const filmsOnPage = [...new Set(getFilmsOnPage(pageHtml))];
            logger.debug(`Found ${filmsOnPage.length} films on ${pagePath}`);

            for (const film of filmsOnPage) {
                const tmdbId = await getTmdbId(film, sessionId);
                if (tmdbId !== null) {
                    importList.push({ id: tmdbId });
                }
            }
        }

        logger.debug(`Matched ${importList.length} TMDB id(s) for list ${path}`);
    } finally {
        logger.info(`Destroying FlareSolverr session ${sessionId}`);
        await destroySession(sessionId);
    }

    if (importList.length === 0) {
        const searchParams = new URL(req.url).searchParams;
        if (!searchParams.has("allow-empty-list")) {
            throw new Error(
                "Found 0 films in list. If this is expected consider appending `?allow-empty-list` to the request URL to prevent future errors.",
            );
        }
    }

    return Response.json(importList);
}
