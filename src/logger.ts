import adze, { setup } from "adze";

setup({
    activeLevel: process.env.LOG_LEVEL ||  process.env.NODE_ENV === "production" ? "info" : "debug",
});

export const logger = adze.timestamp.seal();
