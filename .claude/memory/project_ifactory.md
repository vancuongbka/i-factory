---
name: i-factory project context
description: Manufacturing Execution System monorepo — stack, structure, and conventions
type: project
---
i-factory là hệ thống quản lý sản xuất (MES) đa nhà máy tại c:\Workspace\Sources\i-factory.

**Stack:** NestJS (API, port 3001) + Next.js 15 App Router (web, port 3000) + PostgreSQL + Redis + BullMQ. Turborepo + pnpm workspaces.

**Why:** Được khởi tạo từ đầu vào 2026-04-11 theo yêu cầu của user.

**How to apply:** Khi làm việc trong repo này, tham chiếu CLAUDE.md tại root để biết conventions. Zod là nguồn sự thật cho validation — không dùng class-validator. Multi-factory: mọi query filter theo factoryId.
