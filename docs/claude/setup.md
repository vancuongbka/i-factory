# Setup & Running — i-factory

## Requirements
- Node.js >= 20.x
- pnpm >= 9.x
- Docker + Docker Compose

## Development

```bash
docker-compose up -d                          # Start PostgreSQL + Redis
pnpm install
cp .env.example .env.local
pnpm --filter @i-factory/api db:migrate       # Run migrations
pnpm dev                                      # All apps in parallel
# Or individually:
pnpm --filter @i-factory/api dev             # http://localhost:3001
pnpm --filter @i-factory/web dev             # http://localhost:3000
```

## Production Build

```bash
pnpm build
```

## Test & Quality

```bash
pnpm test                               # Unit tests
pnpm --filter @i-factory/api test:e2e   # E2E (requires DB + Redis)
pnpm typecheck
pnpm lint
pnpm format
```

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Min 32 chars — change before production |
| `NEXT_PUBLIC_API_URL` | NestJS API URL (browser-exposed) |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for Socket.IO client |
| `FACTORY_SYNC_ENABLED` | Enable/disable cross-factory sync |
| `DATABASE_SYNCHRONIZE` | Must be `false` in production |
| `APP_LOCALE` | UI language: `vi` or `en` (default `vi`) |

## Dev Tools

| Tool | URL | Notes |
|------|-----|-------|
| Swagger / API Docs | http://localhost:3001/api/docs | Dev only |
| Bull Board (Queue) | http://localhost:3001/queues | Basic auth: `BULL_BOARD_*` env vars |
| Health Check | http://localhost:3001/health | DB + Redis + Queue status |
| Redis Commander | http://localhost:8081 | Docker service |
| pgAdmin (optional) | http://localhost:5050 | Add to docker-compose if needed |
