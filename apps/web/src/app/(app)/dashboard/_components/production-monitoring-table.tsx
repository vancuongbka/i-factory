'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PRODUCTION_BATCHES } from './dashboard-mock-data';
import type { MachineStatusType } from './dashboard-mock-data';
import { MachineStatusBadge } from './machine-status-badge';

export function ProductionMonitoringTable() {
  const t = useTranslations('dashboard.productionMonitoring');
  const tPeriod = useTranslations('dashboard.periodSelector');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const machineStatusLabels: Record<MachineStatusType, string> = {
    healthy: t('machineStatus.healthy'),
    lowPerformance: t('machineStatus.lowPerformance'),
  };

  const filtered = PRODUCTION_BATCHES.filter(
    (b) =>
      b.batchId.toLowerCase().includes(search.toLowerCase()) ||
      b.garmentType.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

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
          <select
            className="rounded-md border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue="lastWeek"
          >
            <option value="lastWeek">{tPeriod('lastWeek')}</option>
          </select>
          <a
            href="/production"
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
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-border"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.batchId')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.garmentType')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('columns.targetOutput')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('columns.actualOutput')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('columns.efficiency')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.machineStatus')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.materialAvailability')}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('columns.issuesAlerts')}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t('columns.action')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  {t('noResults')}
                </td>
              </tr>
            ) : (
              filtered.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(batch.id)}
                      onChange={() => toggleOne(batch.id)}
                      className="rounded border-border"
                      aria-label={`Select ${batch.batchId}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{batch.batchId}</td>
                  <td className="px-4 py-3">{batch.garmentType}</td>
                  <td className="px-4 py-3 text-right">{batch.targetOutput}</td>
                  <td className="px-4 py-3 text-right">{batch.actualOutput}</td>
                  <td className="px-4 py-3 text-right">{batch.efficiency}%</td>
                  <td className="px-4 py-3">
                    <MachineStatusBadge
                      status={batch.machineStatus}
                      labels={machineStatusLabels}
                    />
                  </td>
                  <td className="px-4 py-3">{batch.materialAvailability}</td>
                  <td className="px-4 py-3 text-muted-foreground">{batch.issuesAlerts}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Navigate to production detail — placeholder for mock
                        }}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`View ${batch.batchId}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Soft-delete placeholder for mock
                        }}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${batch.batchId}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 7a1 1 0 112 0v3a1 1 0 11-2 0V9zm5-1a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
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
