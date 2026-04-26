'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFactory } from '@/providers/factory-provider';
import { apiClient } from '@/lib/api-client';
import type { ReportJobResponse } from '@i-factory/api-types';

type ReportType = 'production' | 'work-orders' | 'inventory' | 'qc';
type ReportFormat = 'json' | 'csv';

interface JobState extends ReportJobResponse {
  progress?: number;
  reportType: ReportType;
  reportFormat: ReportFormat;
}

// ── Status badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    queued:     'bg-amber-100 text-amber-800  dark:bg-amber-900/60  dark:text-amber-300',
    processing: 'bg-blue-100 text-blue-800   dark:bg-blue-900/60   dark:text-blue-300',
    completed:  'bg-green-100 text-green-800  dark:bg-green-900/60  dark:text-green-300',
    failed:     'bg-red-100 text-red-800     dark:bg-red-900/60    dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div
        className="h-1.5 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────

export function ReportsClient() {
  const t = useTranslations('reports');
  const { factoryId } = useFactory();

  const [type, setType] = useState<ReportType>('production');
  const [format, setFormat] = useState<ReportFormat>('json');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [jobs, setJobs] = useState<JobState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll all non-terminal jobs every 2 seconds
  useEffect(() => {
    const poll = async () => {
      const pending = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');
      if (pending.length === 0) return;

      const updated = await Promise.all(
        pending.map(async (j) => {
          try {
            const status = await apiClient.reports.status(j.jobId);
            return { ...j, ...status };
          } catch {
            return j;
          }
        }),
      );

      setJobs((prev) =>
        prev.map((j) => {
          const up = updated.find((u) => u.jobId === j.jobId);
          return up ?? j;
        }),
      );
    };

    pollingRef.current = setInterval(() => { void poll(); }, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factoryId) { setError(t('noFactory')); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await apiClient.reports.request({
        factoryId,
        type,
        dateFrom: new Date(dateFrom).toISOString(),
        dateTo: new Date(dateTo + 'T23:59:59').toISOString(),
        format,
      });
      const newJob: JobState = {
        ...(res as ReportJobResponse),
        progress: 0,
        reportType: type,
        reportFormat: format,
      };
      setJobs((prev) => [newJob, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload(job: JobState) {
    try {
      const blob = await apiClient.reports.download(job.jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.reportType}-report-${job.jobId}.${job.reportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('downloadFailed'));
    }
  }

  const REPORT_TYPES: { value: ReportType; labelKey: string; description: string }[] = [
    { value: 'production', labelKey: 'typeProduction', description: t('typeProductionDesc') },
    { value: 'work-orders', labelKey: 'typeWorkOrders', description: t('typeWorkOrdersDesc') },
    { value: 'inventory', labelKey: 'typeInventory', description: t('typeInventoryDesc') },
    { value: 'qc', labelKey: 'typeQc', description: t('typeQcDesc') },
  ];

  return (
    <div className="space-y-6">
      {/* ── Form card ── */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">{t('formTitle')}</h2>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5">
          {/* Report type */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REPORT_TYPES.map((rt) => (
              <label
                key={rt.value}
                className={
                  'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors ' +
                  (type === rt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:bg-muted/50')
                }
              >
                <input
                  type="radio"
                  name="reportType"
                  value={rt.value}
                  checked={type === rt.value}
                  onChange={() => setType(rt.value)}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">{t(rt.labelKey as Parameters<typeof t>[0])}</span>
                <span className="text-xs text-muted-foreground leading-snug">{rt.description}</span>
              </label>
            ))}
          </div>

          {/* Date range + format */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('dateFrom')}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('dateTo')}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('format')}</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
                className="h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !factoryId}
              className="h-9 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? t('generating') : t('generate')}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </form>
      </div>

      {/* ── Jobs list ── */}
      {jobs.length > 0 && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-base font-semibold">{t('jobsTitle')}</h2>
          </div>
          <div className="divide-y">
            {jobs.map((job) => (
              <div key={job.jobId} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {t(('type' + job.reportType.charAt(0).toUpperCase() + job.reportType.slice(1).replace('-', '')) as Parameters<typeof t>[0])}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">{job.reportFormat}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground font-mono truncate">
                    {t('jobId')}: {job.jobId}
                  </p>
                  {(job.status === 'queued' || job.status === 'processing') && (
                    <div className="mt-2 w-48">
                      <ProgressBar value={job.progress ?? 0} />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {job.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => { void handleDownload(job); }}
                      className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      {t('download')}
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <span className="text-xs text-destructive">{t('failed')}</span>
                  )}
                  {(job.status === 'queued' || job.status === 'processing') && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      {t('processing')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
