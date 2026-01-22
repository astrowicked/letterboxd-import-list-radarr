# letterboxd-import-list-radarr

Allows you to add a Letterboxd list as import list in Radarr.

Works pretty much the same as [screeny05/letterboxd-list-radarr](https://github.com/screeny05/letterboxd-list-radarr), but I wanted something better suitable for self-hosting. And I wanted to try [Bun](https://bun.com/)!

> **NOTE:** Since January 20th Letterboxd has stated using Cloudflare to protect their pages from being scraped, while still offering no public API. [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) is now required to run this application.

## Installation

Spin up the container on its own using the [compose.yaml](compose.yaml) or add it to the compose file of your radarr instance:

```yaml
services:
  letterboxd-import-list-radarr:
    image: ghcr.io/heinheinhein/letterboxd-import-list-radarr
    environment:
      - TZ=Europe/Amsterdam
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
1. Set List URL to the Letterboxd list you want to add. Change the https://letterboxd.com/ to http://letterboxd-import-list-radarr:3000/.
1. Configure the rest of the settings.
1. Test & Save.

## Supported Letterboxd URLs

Most Letterboxd pages that [allow crawling](https://letterboxd.com/robots.txt) are supported. Below are some examples:

| Type         | Letterboxd URL                                                                    | Import URL                                                                                           |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Watchlist    | https://letterboxd.com/joelhaver/watchlist/                                       | http://letterboxd-import-list-radarr:3000/joelhaver/watchlist/                                       |
| List         | https://letterboxd.com/criterion/list/directed-by-michael-mann-criterion-channel/ | http://letterboxd-import-list-radarr:3000/criterion/list/directed-by-michael-mann-criterion-channel/ |
| Filmography  | https://letterboxd.com/actor/dries-roelvink/                                      | http://letterboxd-import-list-radarr:3000/actor/dries-roelvink/                                      |
| Random pages | https://letterboxd.com/films/                                                     | http://letterboxd-import-list-radarr:3000/films/                                                     |

## Notes

- Big lists (>1000 films) may timeout on the first request. The results will be cached to make subsequent requests faster, so try again after a couple of minutes.
- Some pages (like https://letterboxd.com/films/popular/) require client-side javascript to render the films and cannot be scraped by this application.
- By default the application will error when a list has 0 films in it. If you don't want this behaviour and instead want an empty array returned, you can append `?allow-empty-list` to the URL.
