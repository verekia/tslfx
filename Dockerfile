# Build stage

FROM oven/bun:1.1.36-alpine AS builder

WORKDIR /app

COPY bun.lockb package.json ./
COPY patches ./patches
COPY types-three-0.172.9999x.tgz ./types-three-0.172.9999x.tgz

RUN bun i

COPY . .

RUN bun run build

# Production stage

FROM nginx:1.26.2-alpine3.20-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

