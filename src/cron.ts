import { getTmdbId } from "./cache";
import { fetchHtml } from "./fetch";
import { logger } from "./logger";
import { getFilmsOnPage } from "./parse";

const path = "/",
    sessionId = "lilr/films";

Bun.cron("@hourly", async () => {
    logger.info("Running cronjob");

    const pageHtml = await fetchHtml(path, sessionId);

    const filmsOnPage = [...new Set(getFilmsOnPage(pageHtml))];
    logger.debug(`Found ${filmsOnPage.length} films on ${path}`);

    for (const film of filmsOnPage) {
        await getTmdbId(film, sessionId);
    }
});
