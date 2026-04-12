'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ErpSyncPayload, ErpSyncJobResponse } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

const ENTITY_TYPES: ErpSyncPayload['entityType'][] = [
  'products',
  'boms',
  'routings',
  'work-centers',
];

export function ErpSyncForm() {
  const t = useTranslations('masterData.erpSync');
  const { factoryId } = useFactory();

  const [entityType, setEntityType] = useState<ErpSyncPayload['entityType']>('products');
  const [externalSystem, setExternalSystem] = useState('');
  const [syncMode, setSyncMode] = useState<'UPSERT' | 'REPLACE'>('UPSERT');
  const [dryRun, setDryRun] = useState(true);
  const [recordsJson, setRecordsJson] = useState('[]');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState('');

  const trigger = useMutation({
    mutationFn: (payload: ErpSyncPayload) =>
      apiClient.masterData.erpSync.trigger(factoryId!, payload),
    onSuccess: (data) => setJobId(data.jobId),
  });

  const { data: jobStatus } = useQuery({
    queryKey: ['erp-sync-status', factoryId, jobId],
    queryFn: () => apiClient.masterData.erpSync.status(factoryId!, jobId!),
    enabled: !!factoryId && !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data as ErpSyncJobResponse | undefined)?.status;
      return status === 'queued' || status === 'processing' ? 2000 : false;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError('');
    let records: Record<string, unknown>[];
    try {
      records = JSON.parse(recordsJson) as Record<string, unknown>[];
      if (!Array.isArray(records)) throw new Error('Must be a JSON array');
    } catch (err) {
      setJsonError((err as Error).message);
      return;
    }
    trigger.mutate({ entityType, externalSystem, syncMode, dryRun, records });
  };

  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.entityType')}</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as ErpSyncPayload['entityType'])}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {ENTITY_TYPES.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.syncMode')}</label>
            <select
              value={syncMode}
              onChange={(e) => setSyncMode(e.target.value as 'UPSERT' | 'REPLACE')}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="UPSERT">{t('syncModes.UPSERT')}</option>
              <option value="REPLACE">{t('syncModes.REPLACE')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.externalSystem')}</label>
          <input
            required
            value={externalSystem}
            onChange={(e) => setExternalSystem(e.target.value)}
            placeholder="e.g. SAP, Oracle ERP"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.records')}</label>
          <textarea
            required
            value={recordsJson}
            onChange={(e) => setRecordsJson(e.target.value)}
            rows={6}
            className="w-full rounded-md border px-3 py-2 font-mono text-sm"
            placeholder='[{"sku": "P001", "name": "Product A", ...}]'
          />
          {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          {t('fields.dryRun')}
        </label>

        {trigger.error && (
          <p className="text-sm text-destructive">{trigger.error.message}</p>
        )}

        <button
          type="submit"
          disabled={trigger.isPending || !factoryId}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {trigger.isPending ? 'Triggering…' : t('actions.trigger')}
        </button>
      </form>

      {jobId && (
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">Job ID: <span className="font-mono">{jobId}</span></p>
          {jobStatus && (
            <p className="mt-1">
              Status:{' '}
              <span className={`font-semibold ${
                jobStatus.status === 'completed' ? 'text-green-600' :
                jobStatus.status === 'failed' ? 'text-destructive' :
                'text-amber-600'
              }`}>
                {t(`status.${jobStatus.status}`)}
              </span>
            </p>
          )}
          {!jobStatus && <p className="text-muted-foreground">Polling status…</p>}
        </div>
      )}
    </div>
  );
}
