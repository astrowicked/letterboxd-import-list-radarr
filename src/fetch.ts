import robotsParser, { type Robot } from "robots-parser";
import { logger } from "./logger";
import type { FlareSolverrResponse } from "./types";

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

export async function fetchHtml(path: string, sessionId: string): Promise<string> {
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
            disableMedia: true,
            session: sessionId,
        }),
    });
    if (!res.ok) {
        logger.error(`Fetch error fetching ${url} with FlareSolverr: ${res.status} ${res.statusText}`);
    }

    const flaresolverrJson = (await res.json()) as FlareSolverrResponse;
    if (flaresolverrJson.status !== "ok" || flaresolverrJson.solution === undefined) {
        // FlareSolverr omits `solution` entirely on failure (e.g. a challenge
        // timeout) - accessing flaresolverrJson.solution.status here used to
        // throw an uncaught TypeError that silently killed the whole
        // request's remaining work (never reaching destroySession), instead
        // of just failing this one film. Throw a clean, catchable error so
        // callers can skip this one URL and continue.
        throw new Error(
            `FlareSolverr error fetching ${url}: ${flaresolverrJson.status} ${flaresolverrJson.message}`,
        );
    }

    if (flaresolverrJson.solution.status !== 200) {
        logger.error(
            `Solution error fetching ${url} with FlareSolverr: ${flaresolverrJson.solution.status} ${flaresolverrJson.solution.response}`,
        );
    }

    return flaresolverrJson.solution.response;
}

export async function createSession(sessionId: string): Promise<void> {
    await fetch(flaresolverrUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cmd: "sessions.create",
            session: sessionId,
        }),
    });
}

export async function destroySession(sessionId: string): Promise<void> {
    await fetch(flaresolverrUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cmd: "sessions.destroy",
            session: sessionId,
        }),
    });
}
