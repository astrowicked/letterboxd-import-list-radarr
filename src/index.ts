import { getTmdbId } from "./cache";
import { fetchHtml } from "./fetch";
import { logger } from "./logger";
import { getFilmsOnPage, getNumberOfPages } from "./parse";

const server = Bun.serve({
    hostname: process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1",
    development: process.env.NODE_ENV !== "production",
    port: 3000,
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

    const html = await fetchHtml(path);

    const numberOfPages = getNumberOfPages(html);
    logger.debug(`List ${path} has ${numberOfPages} page(s)`);

    const paths = Array.from(Array(numberOfPages).keys(), (index) => `${path}/page/${index + 1}/`);
    const pagesPromises = paths.map(async (p, index) => {
        // html for the first page is already fetched
        return getFilmsOnPage(index === 0 ? html : await fetchHtml(p));
    });

    const pages = await Promise.all(pagesPromises);
    const letterboxdItems = pages.flat(1);
    logger.debug(`Found ${letterboxdItems.length} films for list ${path}`);

    const importList = (await Promise.all(letterboxdItems.map(getTmdbId)))
        .filter((id) => id !== null)
        .map((id) => ({ id }));
    logger.debug(`Matched ${importList.length} TMDB id(s) for list ${path}`);

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
