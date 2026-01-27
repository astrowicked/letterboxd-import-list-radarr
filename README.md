# letterboxd-import-list-radarr

Allows you to add a Letterboxd list as import list in Radarr.

~~Works pretty much the same as [screeny05/letterboxd-list-radarr](https://github.com/screeny05/letterboxd-list-radarr), but I wanted something better suitable for self-hosting. And I wanted to try [Bun](https://bun.com/)!~~

> **NOTE:** Since January 20th Letterboxd has started using Cloudflare to protect their pages from being scraped and specified scraping is against their ToS, all while still offering no public API. Public solutions like [screeny05/letterboxd-list-radarr](https://github.com/screeny05/letterboxd-list-radarr) no longer work. This project still works but now requires [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) to access Letterboxd.

## Installation

Spin up the container on its own using the [compose.yaml](compose.yaml) or add it to the compose file of your radarr instance:

```yaml
services:
  letterboxd-import-list-radarr:
    image: ghcr.io/heinheinhein/letterboxd-import-list-radarr
    volumes:
      - /path/to/cache:/app/cache # optional, make cached films persistent
    restart: unless-stopped

  flaresolverr:
    image: ghcr.io/flaresolverr/flaresolverr
    restart: unless-stopped

  radarr:
    image: lscr.io/linuxserver/radarr
    ...
```

## Configuration

The following environment variables are available:

| variable         | default                    |
| ---------------- | -------------------------- |
| TZ               | `UTC`                      |
| LOG_LEVEL        | `info`                     |
| FLARESOLVERR_URL | `http://flaresolverr:8191` |

### Add list to Radarr

1. In Radarr, go to Settings > Import Lists and add a new list using Custom Lists provider.
1. Set List URL to the Letterboxd list you want to add. Change the `https://letterboxd.com` to `http://letterboxd-import-list-radarr`.
1. Configure the rest of the settings.
1. Test & Save.

## Supported Letterboxd URLs

Most Letterboxd pages that [allow crawling](https://letterboxd.com/robots.txt) are supported. Below are some examples:

| Type        | Letterboxd URL                                                                    | Import URL                                                                                      |
| ----------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Watchlist   | https://letterboxd.com/joelhaver/watchlist/                                       | http://letterboxd-import-list-radarr/joelhaver/watchlist/                                       |
| List        | https://letterboxd.com/criterion/list/directed-by-michael-mann-criterion-channel/ | http://letterboxd-import-list-radarr/criterion/list/directed-by-michael-mann-criterion-channel/ |
| Filmography | https://letterboxd.com/actor/dries-roelvink/                                      | http://letterboxd-import-list-radarr/actor/dries-roelvink/                                      |
| Studio      | https://letterboxd.com/studio/a24/                                                | http://letterboxd-import-list-radarr/studio/a24/                                                |
| Other pages | https://letterboxd.com/films/                                                     | http://letterboxd-import-list-radarr/films/                                                     |

## Notes

- Most lists will timeout on the first request. Because of Cloudflare's protection requests will now take 1-2 seconds. For example, a list with 150 films will take between 150 and 300 seconds to scrape on the first run. The results will be cached to make subsequent requests faster, so try again after a couple of minutes.
- By default the application will error when a list has 0 films in it. If you don't want this behaviour and instead want an empty array returned, you can append `?allow-empty-list` to the URL.
