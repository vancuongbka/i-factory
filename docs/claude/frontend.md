# Next.js Frontend Conventions — `apps/web/`

## App Router Structure

```
src/app/
├── layout.tsx
├── page.tsx                        # Redirects to /vi/dashboard
└── [locale]/                       # 'vi' | 'en'
    ├── layout.tsx                  # Sets <html lang>, NextIntlClientProvider
    ├── (auth)/login/page.tsx
    └── (app)/                      # App shell (Sidebar, Topbar, QueryProvider)
        └── [domain]/
            ├── page.tsx            # Server Component — initial data fetch
            ├── [id]/page.tsx
            └── _components/        # Route-local Client Components
```

## Server vs Client Components

**Server Component** — for initial data fetch:
```tsx
async function ProductionPage() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/production`, {
    headers: { Authorization: `Bearer ${await getServerToken()}` },
    next: { revalidate: 60 },
  });
  return <ProductionTable initialData={await data.json()} />;
}
```

**Client Component** — only when you need hooks, event handlers, mutations, or WebSocket:
```tsx
'use client';
function ProductionTable({ initialData }) {
  const { data } = useQuery({
    queryKey: ['production'],
    queryFn: () => apiClient.production.list(),
    initialData,
  });
}
```

## Data Fetching Rules

- Never fetch URLs directly inside components
- All requests go through `src/lib/api-client.ts`
- Client-side: `apiClient.[domain].[method]()`

## Naming Conventions

- Components: PascalCase, `.tsx`
- Hooks: `use` prefix, camelCase, `.ts`
- Server Actions: `_actions/` at the same route level
- Stores (Zustand): `src/stores/[domain].store.ts`
- Route-local components: `_components/`

## Internationalization (next-intl)

Language is configured via `APP_LOCALE` env var (`vi` or `en`, default `vi`). No locale segment in URLs.

Config: `src/i18n/request.ts` reads `process.env.APP_LOCALE` and loads the matching message file.

Translation files: `messages/vi.json`, `messages/en.json`

**Server Components:**
```tsx
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('dashboard');
```

**Client Components:**
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('dashboard');
```

**Navigation** — use `@/i18n/navigation` (re-exports `next/link` and `next/navigation` unchanged).

**Adding a new string:** add key to both `en.json` and `vi.json`, never hardcode UI text.
