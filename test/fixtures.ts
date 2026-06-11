import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const pages = [
    {
        url: "https://letterboxd.com/awards_season/list/2024-oscars-all-nominated-films/",
        name: "list/2024_oscars_nominated.html",
    },
    {
        url: "https://letterboxd.com/awards_season/list/awards-season-2022-2023/",
        name: "list/2022_2023_awards_season.html",
    },
    {
        url: "https://letterboxd.com/awards_season/list/2025-oscars-short-categories/",
        name: "list/2025_oscars_shorts.html",
    },
    {
        url: "https://letterboxd.com/official/list/letterboxds-top-500-films/",
        name: "list/top_500_narrative.html",
    },
    {
        url: "https://letterboxd.com/director/jacques-demy/",
        name: "filmography/director_jacques_demy.html",
    },
    {
        url: "https://letterboxd.com/actor/gene-wilder/",
        name: "filmography/actor_gene_wilder.html",
    },
    {
        url: "https://letterboxd.com/pietertje2001/watchlist/",
        name: "watchlist/pietertje2001.html",
    },
    {
        url: "https://letterboxd.com/aaaaa/watchlist/",
        name: "watchlist/aaaaa.html",
    },
    {
        url: "https://letterboxd.com/film/sorcerer/",
        name: "film/sorcerer.html",
    },
    {
        url: "https://letterboxd.com/film/the-curse-2023/",
        name: "film/the_curse.html",
    },
    {
        url: "https://letterboxd.com/film/black-mirror-joan-is-awful/",
        name: "film/black_mirror_joan_is_awful.html",
    },
];

for (const { url, name } of pages) {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);

    if (!res.ok) {
        console.error(`Failed to fetch ${url}: ${res.status}`);
        continue;
    }

    const html = await res.text();

    const filePath = join(import.meta.dir, "../test/fixtures", name);

    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, html, "utf8");

    console.log(`Saved ${name}`);
}
