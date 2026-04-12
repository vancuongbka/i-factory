'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  Search, X, Clock, ChevronRight,
  Home, Cog, ClipboardList, Layers, Package, ShieldCheck,
  BarChart3, Bell, Tag, FolderOpen, Hash, Building2,
  GraduationCap, GitBranch, RefreshCw, Users, Plus, FileText,
} from 'lucide-react';

// ─── localStorage helpers ────────────────────────────────────────────────────

const RECENT_KEY = 'ifactory:cmd:recent';

function getStoredRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]; }
  catch { return []; }
}

function pushRecent(href: string): void {
  const prev = getStoredRecent().filter((h) => h !== href);
  localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...prev].slice(0, 5)));
}

// ─── Static item definitions ─────────────────────────────────────────────────

interface NavDef { id: string; navKey: string; href: string; Icon: LucideIcon }
interface ActionDef { id: string; cmdKey: string; href: string; Icon: LucideIcon }

const NAV_ITEMS: NavDef[] = [
  { id: '/dashboard',                navKey: 'dashboard',      href: '/dashboard',                Icon: Home },
  { id: '/production',               navKey: 'production',     href: '/production',               Icon: Cog },
  { id: '/work-orders',              navKey: 'workOrders',     href: '/work-orders',              Icon: ClipboardList },
  { id: '/bom',                      navKey: 'bom',            href: '/bom',                      Icon: Layers },
  { id: '/inventory',                navKey: 'inventory',      href: '/inventory',                Icon: Package },
  { id: '/quality-control',          navKey: 'qualityControl', href: '/quality-control',          Icon: ShieldCheck },
  { id: '/reports',                  navKey: 'reports',        href: '/reports',                  Icon: BarChart3 },
  { id: '/notifications',            navKey: 'notifications',  href: '/notifications',            Icon: Bell },
  { id: '/master-data/products',     navKey: 'products',       href: '/master-data/products',     Icon: Tag },
  { id: '/master-data/categories',   navKey: 'categories',     href: '/master-data/categories',   Icon: FolderOpen },
  { id: '/master-data/uoms',         navKey: 'uoms',           href: '/master-data/uoms',         Icon: Hash },
  { id: '/master-data/work-centers', navKey: 'workCenters',    href: '/master-data/work-centers', Icon: Building2 },
  { id: '/master-data/skills',       navKey: 'skills',         href: '/master-data/skills',       Icon: GraduationCap },
  { id: '/master-data/routings',     navKey: 'routings',       href: '/master-data/routings',     Icon: GitBranch },
  { id: '/master-data/erp-sync',     navKey: 'erpSync',        href: '/master-data/erp-sync',     Icon: RefreshCw },
  { id: '/settings/users',           navKey: 'users',          href: '/settings/users',           Icon: Users },
];

const ACTION_ITEMS: ActionDef[] = [
  { id: 'new-work-order',         cmdKey: 'newWorkOrder',         href: '/work-orders/new',                      Icon: Plus },
  { id: 'new-production-order',   cmdKey: 'newProductionOrder',   href: '/production/new',                       Icon: Plus },
  { id: 'new-inspection',         cmdKey: 'newInspection',        href: '/quality-control/inspections/new',      Icon: Plus },
  { id: 'generate-report',        cmdKey: 'generateReport',       href: '/reports',                              Icon: FileText },
  { id: 'add-material',           cmdKey: 'addMaterial',          href: '/inventory/materials/new',              Icon: Plus },
];

// IDs shown in "Suggested" when the query is empty
const SUGGESTED_IDS = ['/dashboard', '/production', '/work-orders', '/reports'];

// ─── Flat item used for keyboard navigation ──────────────────────────────────

interface FlatItem {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  isAction: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const tNav = useTranslations('nav');
  const tCmd = useTranslations('commandPalette');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);

  // Translation helpers
  const navLabel = (key: string) => tNav(key as Parameters<typeof tNav>[0]);
  const cmdLabel = (key: string) => tCmd(key as Parameters<typeof tCmd>[0]);

  // Reset state and focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setRecentHrefs(getStoredRecent());
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  // ─── Compute sections based on query ────────────────────────────────────

  const q = query.toLowerCase();

  const filteredNav = query
    ? NAV_ITEMS.filter((n) => navLabel(n.navKey).toLowerCase().includes(q))
    : [];

  const filteredActions = query
    ? ACTION_ITEMS.filter((a) => cmdLabel(a.cmdKey).toLowerCase().includes(q))
    : [];

  const recentItems = !query
    ? recentHrefs
        .map((href) => NAV_ITEMS.find((n) => n.id === href))
        .filter((n): n is NavDef => !!n)
        .slice(0, 3)
    : [];

  const suggestedItems = !query
    ? NAV_ITEMS.filter((n) => SUGGESTED_IDS.includes(n.id))
    : [];

  // Flat list in display order — used to resolve keyboard activeIndex
  const flatItems: FlatItem[] = query
    ? [
        ...filteredNav.map((n) => ({ id: n.id, label: navLabel(n.navKey), href: n.href, Icon: n.Icon, isAction: false })),
        ...filteredActions.map((a) => ({ id: a.id, label: cmdLabel(a.cmdKey), href: a.href, Icon: a.Icon, isAction: true })),
      ]
    : [
        ...recentItems.map((n) => ({ id: `r:${n.id}`, label: navLabel(n.navKey), href: n.href, Icon: n.Icon, isAction: false })),
        ...suggestedItems.map((n) => ({ id: `s:${n.id}`, label: navLabel(n.navKey), href: n.href, Icon: n.Icon, isAction: false })),
      ];

  const noResults = !!query && flatItems.length === 0;

  // Reset active index when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  // ─── Navigation ──────────────────────────────────────────────────────────

  function navigate(href: string) {
    pushRecent(href);
    onOpenChange(false);
    router.push(href);
  }

  // ─── Keyboard handler (attached to the dialog div) ────────────────────

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        onOpenChange(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(flatItems.length, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + Math.max(flatItems.length, 1)) % Math.max(flatItems.length, 1));
        break;
      case 'Enter': {
        const item = flatItems[activeIndex];
        if (item) navigate(item.href);
        break;
      }
    }
  }

  if (!open) return null;

  // ─── Row renderer ────────────────────────────────────────────────────────

  function ItemRow({ flatId, label, href, Icon, isAction }: { flatId: string; label: string; href: string; Icon: LucideIcon; isAction: boolean }) {
    const idx = flatItems.findIndex((f) => f.id === flatId);
    const active = idx === activeIndex;
    return (
      <button
        type="button"
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => navigate(href)}
        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
          active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        }`}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-primary-foreground' : isAction ? 'text-blue-500' : 'text-muted-foreground'}`} />
        <span className="flex-1 truncate text-left">{label}</span>
        <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 ${active ? 'text-primary-foreground/60' : 'text-muted-foreground/40'}`} />
      </button>
    );
  }

  // ─── Section header ───────────────────────────────────────────────────────

  function SectionHeader({ icon, labelKey }: { icon?: React.ReactNode; labelKey: string }) {
    return (
      <p className="mb-0.5 flex items-center gap-1.5 px-3 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {cmdLabel(labelKey)}
      </p>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCmd('placeholder')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={tCmd('placeholder')}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="inline-flex flex-shrink-0 items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Esc
            </kbd>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto px-2 pb-2">
          {noResults ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {tCmd('noResults')}
            </p>
          ) : query ? (
            /* ── Search results ── */
            <>
              {filteredNav.length > 0 && (
                <div>
                  <SectionHeader labelKey="navigation" />
                  {filteredNav.map((n) => (
                    <ItemRow key={n.id} flatId={n.id} label={navLabel(n.navKey)} href={n.href} Icon={n.Icon} isAction={false} />
                  ))}
                </div>
              )}
              {filteredActions.length > 0 && (
                <div className={filteredNav.length > 0 ? 'mt-1' : ''}>
                  <SectionHeader labelKey="quickActions" />
                  {filteredActions.map((a) => (
                    <ItemRow key={a.id} flatId={a.id} label={cmdLabel(a.cmdKey)} href={a.href} Icon={a.Icon} isAction />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ── Empty state ── */
            <>
              {recentItems.length > 0 && (
                <div>
                  <SectionHeader icon={<Clock className="h-3 w-3" />} labelKey="recent" />
                  {recentItems.map((n) => (
                    <ItemRow key={`r:${n.id}`} flatId={`r:${n.id}`} label={navLabel(n.navKey)} href={n.href} Icon={n.Icon} isAction={false} />
                  ))}
                </div>
              )}
              <div className={recentItems.length > 0 ? 'mt-1' : ''}>
                <SectionHeader labelKey="suggested" />
                {suggestedItems.map((n) => (
                  <ItemRow key={`s:${n.id}`} flatId={`s:${n.id}`} label={navLabel(n.navKey)} href={n.href} Icon={n.Icon} isAction={false} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer — keyboard hints */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑</kbd>
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↓</kbd>
              {tCmd('navigate')}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd>
              {tCmd('select')}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Esc</kbd>
            {tCmd('close')}
          </span>
        </div>
      </div>
    </div>
  );
}
