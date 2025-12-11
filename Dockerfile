# Build stage

FROM oven/bun:1.3.4-alpine AS builder

WORKDIR /app

COPY bun.lock package.json ./
COPY patches patches

RUN bun i

COPY . .

RUN bun run build

# Production stage

FROM nginx:1.26.2-alpine3.20-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

