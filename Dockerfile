FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install
ENV NODE_ENV=production
COPY . .
RUN cd /app && \
  bun install --frozen-lockfile --production && \
  bun run build

FROM base AS release
RUN mkdir -p /app/cache && \
  chown -R bun: /app

COPY package.json .
COPY --from=install /app/out out
COPY --from=install /app/drizzle drizzle

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]
