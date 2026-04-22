# ADR 001: Monorepo Structure — Turborepo + pnpm Workspaces

**Date:** 2026-04-11
**Status:** Accepted

## Context

i-factory needs to manage multiple apps (NestJS API, Next.js frontend) alongside shared packages.
The solution must:
- Share TypeScript types between backend and frontend without duplication
- Manage dependencies efficiently
- Build in the correct dependency order
- Support fast CI caching on a multi-app repository

## Decision

Use **Turborepo + pnpm workspaces** with the following structure:

```
apps/     — runnable applications (api, web)
packages/ — shared libraries (api-types, database, ui, utils, config)
```

### Rationale

**Turborepo over Nx:**
- Lighter weight — no generator/schematic boilerplate required
- Remote caching out-of-the-box
- The `turbo.json` pipeline is expressive enough for this use case

**pnpm over npm/yarn:**
- Symlink-based `node_modules` saves disk space and installs faster
- Strict peer dependency enforcement
- The `workspace:*` protocol is simple and explicit

**`packages/api-types` uses Zod instead of class-validator:**
- Zod schemas are plain objects importable in both Node.js and the browser
- `class-validator` depends on `reflect-metadata`, which is incompatible with the Next.js bundle
- A single schema validates on both the server (NestJS pipe) and the client (form validation)

## Consequences

**Positive:**
- End-to-end type safety: a DTO change in the backend immediately surfaces as a TypeScript error in the frontend
- Clear build pipeline: packages build before apps
- Turbo cache: nothing is rebuilt if inputs have not changed

**Negative:**
- Additional setup steps compared to a simple single-app project
- Developers must understand workspace dependency resolution
- `packages/database` holds TypeORM entities — it must stay in sync when entities change
