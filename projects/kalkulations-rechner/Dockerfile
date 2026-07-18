FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime

RUN addgroup -S nuxt && adduser -S nuxt -G nuxt

WORKDIR /app

COPY --from=build --chown=nuxt:nuxt /app/.output ./.output

USER nuxt

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", ".output/server/index.mjs"]
