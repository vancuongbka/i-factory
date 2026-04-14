# 🏭 iFactory - Smart Manufacturing Execution System (MES)

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444?style=flat-square&logo=turborepo)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**iFactory** is a next-generation Manufacturing Execution System designed to digitize and optimize shop-floor operations. Built with a focus on real-time data, AI-driven insights, and a seamless developer experience using a Monorepo architecture.

---

## 🚀 Key Features

### 📊 Real-time Operational Dashboard
- **OEE Monitoring:** Track Overall Equipment Effectiveness (Availability, Performance, Quality) in real-time.
- **Downtime Analysis:** Automatically detect and categorize machine stops (Technical, Material Shortage, Maintenance).
- **Yield Tracking:** Monitor production quality and defect rates with interactive visualizations.

### ⌨️ Command Center (Quick Navigation)
- **Universal Search (Ctrl + K):** Navigate through the system, find specific Batch IDs, or locate machines instantly.
- **Hybrid Search Engine:** Combines instant client-side filtering (Menus/Actions) with debounced server-side querying (Records) for maximum performance.

### 🛠 Manufacturing & Inventory Control
- **Dynamic BOM Management:** Multi-level Bill of Materials management.
- **Work Order Lifecycle:** End-to-end tracking of production batches from planning to completion.
- **Smart Inventory Alerts:** Automated notifications for low stock based on upcoming production schedules.

### 🤖 AI-Powered Automation
- **n8n Workflows:** Automated report generation and shift summaries.
- **Predictive Insights:** Leveraging AI agents to forecast material requirements and maintenance windows.

---

## 🏗 System Architecture

The project leverages a **Turborepo Monorepo** structure to ensure high code reusability, consistent type-safety, and optimized build pipelines.

```text
.
├── apps
│   ├── web          # Frontend: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
│   └── api          # Backend: NestJS, Prisma ORM, Swagger API Docs
├── packages
│   ├── ui           # Shared UI component library (shadcn-based)
│   ├── config       # Shared ESLint, TypeScript, and Tailwind configurations
│   └── types        # Common TypeScript interfaces shared across FE & BE
└── turbo.json       # Build pipeline and remote caching configuration

## 🛠 Tech Stack

**Frontend:** Next.js 14, TanStack Query, Recharts, Lucide Icons, shadcn/ui  
**Backend:** NestJS, TypeScript, Passport.js (JWT Authentication)  
**Database:** PostgreSQL with Prisma ORM  
**DevOps & Tools:** Docker, n8n, Vercel (Frontend), Render (Backend), Supabase (Database)

---

## 💎 Engineering Excellence

- **Performance First:** Implemented advanced debouncing and caching strategies for heavy data lookups.
- **End-to-End Type Safety:** Shared type definitions across the monorepo reduce runtime errors significantly.
- **Industrial UX:** Designed for high-density data environments with full keyboard support and high-contrast visuals.

---

## 🚦 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ifactory.git
cd ifactory
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create `.env` files in:
- `apps/api`
- `apps/web`

Based on the provided `.env.example` templates.

### 4. Start Development Mode

```bash
pnpm dev
```

- **Web App:** http://localhost:3000  
- **API Docs:** http://localhost:3001/api/docs

---

## 🗺 Roadmap

- [x] Core Master Data Modules (BOM, Products, Machines)
- [x] Operational Dashboard with OEE Tracking
- [x] Global Command Palette (Quick Nav)
- [ ] IoT Integration for direct PLC data ingestion
- [ ] Mobile PWA for shop-floor operators

---

## 👤 Author

**CUONG NGUYEN** — Senior Software Engineer  

- **LinkedIn:** https://www.linkedin.com/in/vancuong-nguyen/  
- **Email:** vancuongbka@gmail.com  
- **Live Project:** http://localhost:3000

---

Built with ❤️ for a more efficient manufacturing world.
