import robotsParser, { type Robot } from "robots-parser";
import pThrottle from "p-throttle";
import { logger } from "./logger";
import type { FlareSolverrResponse } from "./types";

const throttle = pThrottle({
    limit: 3,
    interval: 1000,
});

const flaresolverrBaseUrl = process.env.FLARESOLVERR_URL || "http://flaresolverr:8191";
const flaresolverrUrl = `${flaresolverrBaseUrl}/v1`;

const baseUrl = "https://letterboxd.com";
const robotsUrl = `${baseUrl}/robots.txt`;
let robots: Robot | undefined;

try {
    const robotsTxt = await (await fetch(robotsUrl)).text();
    robots = robotsParser(robotsUrl, robotsTxt);
} catch (error) {
    logger.error(`Error fetching robots.txt: ${(error as Error).message}`);
    throw error;
}

async function _fetchHtml(path: string): Promise<string> {
    const url = baseUrl + path;

    if (robots === undefined || robots.isDisallowed(url)) {
        throw new Error("URL disallowed by robots.txt");
    }

    logger.debug(`Fetching ${url}`);
    const res = await fetch(flaresolverrUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cmd: "request.get",
            url: url,
        }),
    });
    if (!res.ok) {
        logger.error(`Fetch error fetching ${url} with FlareSolverr: ${res.status} ${res.statusText}`);
    }

    const flaresolverrJson = (await res.json()) as FlareSolverrResponse;
    if (flaresolverrJson.status !== "ok") {
        logger.error(
            `FlareSolverr error fetching ${url} with FlareSolverr: ${flaresolverrJson.status} ${flaresolverrJson.message}`,
        );
    }

    if (flaresolverrJson.solution.status !== 200) {
        logger.error(
            `Solution error fetching ${url} with FlareSolverr: ${flaresolverrJson.solution.status} ${flaresolverrJson.solution.response}`,
        );
    }

    return flaresolverrJson.solution.response;
}

export const fetchHtml = throttle(_fetchHtml);
