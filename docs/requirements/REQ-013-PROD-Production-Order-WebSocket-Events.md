---
id: REQ-013-PROD-Production-Order-WebSocket-Events
title: Production Order Real-time WebSocket Events
status: inferred
priority: high
tags: [production, websocket, real-time, gateway, notifications]
source_files:
  - apps/api/src/modules/production/production.gateway.ts
  - apps/api/src/modules/production/production.module.ts
  - apps/api/src/modules/production/production.service.ts
  - packages/api-types/src/schemas/notification.schema.ts
created: 2026-04-18
updated: 2026-04-18
owner: unassigned
linked_tasks: []
---

## Description

The production module provides a WebSocket gateway that allows factory floor clients to subscribe to real-time production events. Clients connect to the `/production` namespace, declare which factory they belong to, and are placed into a factory-scoped room so that broadcasts reach only the relevant audience. The gateway is intended to emit events when production orders are created, updated, or completed, enabling dashboards and operator screens to refresh without polling.

## Acceptance Criteria

- [ ] The WebSocket gateway is registered on the Socket.io namespace `/production`.
- [ ] On connection, a client joins a room named `factory:{factoryId}` if `factoryId` is provided in the Socket.io handshake `auth` object.
- [ ] On disconnection, the client's disconnect is logged.
- [ ] The gateway exposes an `emitToFactory(factoryId, event, data)` method for broadcasting an arbitrary event to all clients in a factory room.
- [ ] CORS is configured as `origin: '*'` on the gateway.
- [ ] The notification schema defines two production-related event type strings: `'production:order-created'` and `'production:order-completed'`.

## Inferred Business Rules

- **`emitToFactory` is never called by `ProductionService`**: the gateway is a registered provider in `ProductionModule` but `ProductionService` does not inject it. No production CRUD operation currently emits a WebSocket event. The feature is structurally scaffolded but functionally incomplete.
- **No JWT validation on WebSocket connection**: the `handleConnection` method has an explicit `// TODO: validate JWT from handshake and join factory room` comment. Any client that supplies a `factoryId` in `auth` will join the room without authentication checks.
- **Factory room join is best-effort**: if the client does not supply `factoryId` in `auth`, it connects successfully but joins no factory room and will receive no factory-scoped broadcasts.
- **Event naming convention**: the notification schema uses `production:order-created` and `production:order-completed` — conforming to the monorepo's `<domain>:<past-tense-verb>` convention. A `production:order-updated` or `production:order-cancelled` event is implied but not defined in any schema.
- **`ProductionGateway` is distinct from `NotificationsGateway`**: both gateways implement `emitToFactory`. The `NotificationsService` calls `NotificationsGateway.emitToFactory`, not `ProductionGateway.emitToFactory`. Whether production events are meant to flow through the notifications gateway or the production gateway is not resolved in the code.
- **Seed data confirms event intent**: the database seed creates a notification record with type `'production:order-created'`, confirming the event was always intended to fire on order creation.

## Open Questions

1. **Gateway never wired to service**: `ProductionService` does not inject `ProductionGateway`. Is wiring intentionally deferred, or was it overlooked? Should `create()`, `update()`, and `remove()` in `ProductionService` emit events after saving?
2. **Which gateway handles production events?**: both `ProductionGateway` and `NotificationsGateway` exist with the same `emitToFactory` signature. Should production events be emitted through the production-specific gateway, the notifications gateway, or both?
3. **JWT validation TODO**: the `handleConnection` has an explicit TODO for JWT validation. Without it, any browser can join any factory room. When will auth be added to the WebSocket handshake?
4. **Event payload schema**: no TypeScript type or Zod schema defines the shape of `production:order-created` / `production:order-completed` event payloads. What data should be included (full order object, delta, just ID)?
5. **Missing event types**: `production:order-updated`, `production:order-cancelled`, `production:order-paused` are not defined in the notification schema. Should status transitions emit distinct events?
6. **Frontend WebSocket consumer**: no frontend code was found that connects to the `/production` namespace or listens for production events. Is the client-side consumer yet to be implemented?
7. **CORS wildcard**: `cors: { origin: '*' }` is insecure for production deployments. Should this be locked to the frontend origin?

## Context for Claude

- **Stack**: NestJS Socket.io 4.7, `@nestjs/websockets`. Gateway class: `ProductionGateway` in `production.gateway.ts`.
- **Namespace**: `/production` (distinct from the notifications namespace).
- **Room naming**: `factory:{factoryId}` — identical convention to `NotificationsGateway`.
- **Provider registration**: `ProductionGateway` is in `ProductionModule.providers` and injected nowhere in the module. It could be injected into `ProductionService` to wire events with minimal changes.
- **Related features**: PROD-001 (production order CRUD — where events should originate). REQ-048/REQ-049 (Notifications module — parallel gateway for general notifications, also uses `emitToFactory`).
- **Known incomplete state**: this feature is intentionally flagged as a scaffold. The TODO comment in `handleConnection` and the absence of any `emitToFactory` calls from `ProductionService` confirm the feature was started but not completed.
