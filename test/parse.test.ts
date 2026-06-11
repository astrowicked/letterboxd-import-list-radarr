import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { getFilmsOnPage, getNumberOfPages, extractTmdbId } from "../src/parse";
import oscarsNominatedExpected from "./expected/films/2024_oscars_nominated.json";
import oscarsShortsExpected from "./expected/films/2025_oscars_shorts.json";
import awardsSeasonExpected from "./expected/films/2022_2023_awards_season.json";
import actorGeneWilderExpected from "./expected/films/actor_gene_wilder.json";
import directorJacquesDemyExpected from "./expected/films/director_jacques_demy.json";

describe("Letterboxd HTML parser", () => {
    describe("Extract number of pages", () => {
        test("Single page list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2024_oscars_nominated.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });

        test("Single page ranked list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2025_oscars_shorts.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });

        test("Multi page list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2022_2023_awards_season.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(2);
        });

        test("Multi page ranked list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/top_500_narrative.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(5);
        });

        test("Empty watchlist", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/watchlist/aaaaa.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });

        test("Big watchlist", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/watchlist/pietertje2001.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBeGreaterThan(1);
        });

        test("Film page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/film/sorcerer.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });

        test("Filmography actor page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/filmography/actor_gene_wilder.html"), "utf8");
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });

        test("Filmography director page", () => {
            const html = readFileSync(
                join(import.meta.dir, "./fixtures/filmography/director_jacques_demy.html"),
                "utf8",
            );
            const numberOfPages = getNumberOfPages(html);
            expect(numberOfPages).toBe(1);
        });
    });

    describe("Extract films on page", () => {
        test("Single page list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2024_oscars_nominated.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual(oscarsNominatedExpected);
        });

        test("Single page ranked list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2025_oscars_shorts.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual(oscarsShortsExpected);
        });

        test("Multi page list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2022_2023_awards_season.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual(awardsSeasonExpected);
        });

        test("Multi page ranked list", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/top_500_narrative.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toBeArrayOfSize(100);
        });

        test("Empty watchlist", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/watchlist/aaaaa.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual([]);
        });

        test("Big watchlist", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/watchlist/pietertje2001.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toBeArrayOfSize(28);
        });

        test("Film page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/film/sorcerer.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage.length).toBeGreaterThan(1);
        });

        test("Filmography actor page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/filmography/actor_gene_wilder.html"), "utf8");
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual(actorGeneWilderExpected);
        });

        test("Filmography director page", () => {
            const html = readFileSync(
                join(import.meta.dir, "./fixtures/filmography/director_jacques_demy.html"),
                "utf8",
            );
            const filmsOnPage = getFilmsOnPage(html);
            expect(filmsOnPage).toEqual(directorJacquesDemyExpected);
        });
    });

    describe("Extract TMDB ID on page", () => {
        test("Film page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/film/sorcerer.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBe(38985);
        });

        test("Series page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/film/the_curse.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBeNull();
        });

        test("Series episode page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/film/black_mirror_joan_is_awful.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBe(1135539);
        });

        test("List page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/list/2022_2023_awards_season.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBeNull();
        });

        test("Watchlist page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/watchlist/pietertje2001.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBeNull();
        });

        test("Filmography page", () => {
            const html = readFileSync(join(import.meta.dir, "./fixtures/filmography/actor_gene_wilder.html"), "utf8");
            const tmdbId = extractTmdbId(html);
            expect(tmdbId).toBeNull();
        });
    });
});
