FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


FROM node:24-alpine AS deps-prod
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --no-cache

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production


RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/dist/src ./dist
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD wget -qO- http://localhost:3000/api/healthz || exit 1
CMD ["node", "dist/main.js"]
