import { load } from "cheerio/slim";

export function getNumberOfPages(html: string): number {
    const $ = load(html);
    const { number } = $.extract({
        number: "li.paginate-page:last-child",
    });
    if (number === undefined) return 1;

    const numberOfPages = parseInt(number);
    return isNaN(numberOfPages) ? 1 : numberOfPages;
}

export function getFilmsOnPage(html: string): string[] {
    const $ = load(html);
    const { films } = $.extract({
        films: [
            {
                selector: "div",
                value: (el) => {
                    return $(el).attr("data-item-link");
                },
            },
        ],
    });

    return films.filter((link) => link !== undefined);
}

export function extractTmdbId(html: string): number | null {
    const $ = load(html);
    const { tmdbId } = $.extract({
        tmdbId: {
            selector: 'a[data-track-action="TMDB"]',
            value: (el) => {
                const link = $(el).attr("href");
                if (link === undefined) return undefined;
                const idString = link.replace("https://www.themoviedb.org/movie/", "").replace("/", "");
                const id = parseInt(idString);
                return id;
            },
        },
    });

    return tmdbId === undefined || isNaN(tmdbId) ? null : tmdbId;
}
