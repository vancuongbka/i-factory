# NestJS Backend Conventions — `apps/api/`

## Domain Module Structure

```
modules/work-orders/
├── work-orders.module.ts
├── work-orders.controller.ts
├── work-orders.service.ts
├── entities/
│   └── work-order.entity.ts
└── dto/
    ├── create-work-order.dto.ts
    └── update-work-order.dto.ts
```

## Validation — Zod only (never class-validator)

```typescript
@Post()
@UsePipes(new ZodValidationPipe(createWorkOrderSchema))
create(@Body() dto: CreateWorkOrderDto) { ... }
```

- Use `ZodValidationPipe` from `src/common/pipes/zod-validation.pipe.ts`
- Import schemas from `@i-factory/api-types`

## Guard Order

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, FactoryAccessGuard)
```

## Standard Response Format (auto-wrapped by TransformInterceptor)

```json
{ "data": { ... }, "meta": { "timestamp": "...", "requestId": "..." } }
```

Pagination:
```json
{ "data": [...], "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }
```

## WebSocket Gateways

- Namespace: `@WebSocketGateway({ namespace: '/production' })`
- Event naming: `<domain>:<past-tense-verb>` (e.g. `production:order-created`)
- Rooms: `factory:{factoryId}` — clients join on connect
- Auth: JWT in handshake, validated in `handleConnection()`

## BullMQ Processors

- Place in `processors/` directory of the owning module
- Queue names: `reports`, `factory-sync`, `notifications`
- Retry: 3 attempts, exponential backoff
- Jobs must be idempotent

## Database Conventions (TypeORM)

- PK: `@PrimaryGeneratedColumn('uuid')`
- Always: `@CreateDateColumn`, `@UpdateDateColumn`
- Soft delete: `@DeleteDateColumn` — never hard-delete
- Custom fields: `@Column({ type: 'jsonb', nullable: true })`
- Every entity carries `factoryId: string` (except Users, Factories)
- Never use `synchronize: true` in production — use migration files
