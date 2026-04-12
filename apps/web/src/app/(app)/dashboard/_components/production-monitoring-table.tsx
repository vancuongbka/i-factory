'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DashboardResponse } from '@i-factory/api-types';

interface ActiveWorkOrdersTableProps {
  data: DashboardResponse['activeWorkOrders'] | undefined;
  isLoading: boolean;
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 80 ? 'bg-green-500' : value >= 40 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}

function EtaCell({ eta }: { eta: string }) {
  const date = new Date(eta);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = date.toLocaleDateString();
  const isOverdue = diffDays < 0;
  const isSoon = diffDays >= 0 && diffDays <= 2;
  return (
    <span className={`text-sm ${isOverdue ? 'font-semibold text-destructive' : isSoon ? 'font-medium text-amber-600' : 'text-foreground'}`}>
      {label}
      {isOverdue && <span className="ml-1 text-xs">({Math.abs(diffDays)}d overdue)</span>}
      {isSoon && !isOverdue && <span className="ml-1 text-xs text-amber-500">({diffDays}d)</span>}
    </span>
  );
}

export function ProductionMonitoringTable({ data, isLoading }: ActiveWorkOrdersTableProps) {
  const t = useTranslations('dashboard.workOrders');
  const [search, setSearch] = useState('');

  const rows = (data ?? []).filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <h2 className="text-base font-semibold">{t('title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border bg-background py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <a
            href="/work-orders"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('viewAll')} →
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.code')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.product')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.progress')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.eta')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {data?.length === 0 ? t('noActive') : t('noResults')}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-medium">{row.code}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{row.productName}</td>
                  <td className="px-4 py-3">
                    <ProgressBar value={row.progress} />
                  </td>
                  <td className="px-4 py-3">
                    <EtaCell eta={row.eta} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
