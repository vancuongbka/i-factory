'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, ChevronRight } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ScheduleEntryStatus } from '@i-factory/api-types';
import type {
  CncMachineResponse,
  ScheduleEntryResponse,
  ProductionLogResponse,
} from '@i-factory/api-types';
import { useCncMachines } from '@/hooks/use-cnc-machines';
import {
  useDailyScheduleByDate,
  useCreateDailySchedule,
  useScheduleEntries,
  useScheduleEntry,
  useCreateScheduleEntry,
  useUpdateScheduleEntry,
  useAdvanceEntryStatus,
  useProductionLogs,
  useCreateProductionLog,
} from '@/hooks/use-cnc';
import { useCncWebSocket } from '@/hooks/use-cnc-websocket';

// ── Constants ────────────────────────────────────────────────────────────────

const GANTT_START_H = 6;
const GANTT_END_H = 23;
const HOURS = GANTT_END_H - GANTT_START_H;
const HOUR_PX = 80;
const ROW_H = 64;
const LABEL_W = 180;
const TOTAL_W = HOURS * HOUR_PX;

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoToX(iso: string): number {
  const d = new Date(iso);
  return (d.getHours() + d.getMinutes() / 60 - GANTT_START_H) * HOUR_PX;
}

function durationPx(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return (ms / 3_600_000) * HOUR_PX;
}

function snapX(x: number): number {
  const quarterPx = HOUR_PX / 4; // 15-min snap
  return Math.round(x / quarterPx) * quarterPx;
}

function xToIso(x: number, dateStr: string): string {
  const clamped = Math.max(0, Math.min(x, TOTAL_W));
  const totalMin = (clamped / HOUR_PX) * 60 + GANTT_START_H * 60;
  const h = Math.floor(totalMin / 60);
  const m = Math.floor(totalMin % 60);
  return new Date(
    `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`,
  ).toISOString();
}

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayLocalDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ── Status maps ───────────────────────────────────────────────────────────────

const ENTRY_COLORS: Record<ScheduleEntryStatus, string> = {
  [ScheduleEntryStatus.PENDING]:   'bg-slate-300 text-slate-800',
  [ScheduleEntryStatus.SETUP]:     'bg-blue-400 text-white',
  [ScheduleEntryStatus.RUNNING]:   'bg-green-500 text-white',
  [ScheduleEntryStatus.PAUSED]:    'bg-amber-400 text-amber-900',
  [ScheduleEntryStatus.COMPLETED]: 'bg-emerald-600 text-white',
  [ScheduleEntryStatus.ERROR]:     'bg-red-500 text-white',
};

const VALID_TRANSITIONS: Record<ScheduleEntryStatus, ScheduleEntryStatus[]> = {
  [ScheduleEntryStatus.PENDING]:   [ScheduleEntryStatus.SETUP],
  [ScheduleEntryStatus.SETUP]:     [ScheduleEntryStatus.RUNNING],
  [ScheduleEntryStatus.RUNNING]:   [ScheduleEntryStatus.PAUSED, ScheduleEntryStatus.COMPLETED, ScheduleEntryStatus.ERROR],
  [ScheduleEntryStatus.PAUSED]:    [ScheduleEntryStatus.RUNNING, ScheduleEntryStatus.ERROR],
  [ScheduleEntryStatus.COMPLETED]: [],
  [ScheduleEntryStatus.ERROR]:     [ScheduleEntryStatus.SETUP, ScheduleEntryStatus.RUNNING],
};

// ── EntryBar ──────────────────────────────────────────────────────────────────

function EntryBar({
  entry,
  isSelected,
  onSelect,
}: {
  entry: ScheduleEntryResponse;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const tEntries = useTranslations('cnc.entries');
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { entry },
  });

  const left = Math.max(0, isoToX(entry.plannedStart));
  const rawWidth = durationPx(entry.plannedStart, entry.plannedEnd);
  const width = Math.max(Math.min(rawWidth, TOTAL_W - left), HOUR_PX / 4);

  const style: React.CSSProperties = {
    position: 'absolute',
    left,
    top: 8,
    height: ROW_H - 16,
    width,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.75 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    transform: transform
      ? CSS.Transform.toString({ ...transform, y: 0, scaleX: 1, scaleY: 1 })
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`select-none overflow-hidden rounded px-1.5 text-xs font-medium ${ENTRY_COLORS[entry.status]} ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onSelect(entry.id); }}
    >
      <p className="truncate leading-tight pt-0.5">{entry.partName}</p>
      <p className="truncate leading-tight opacity-75">{tEntries(`status.${entry.status}` as Parameters<typeof tEntries>[0])}</p>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label className="text-xs font-medium">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}

// ── NewEntryModal ─────────────────────────────────────────────────────────────

interface NewEntryDraft {
  machineId: string;
  plannedStart: string;
  plannedEnd: string;
}

function NewEntryModal({
  scheduleId,
  draft,
  onClose,
}: {
  scheduleId: string;
  draft: NewEntryDraft;
  onClose: () => void;
}) {
  const t = useTranslations('cnc.planning.form');
  const createEntry = useCreateScheduleEntry();

  const [form, setForm] = useState({
    workOrderId: '',
    productionOrderId: '',
    partName: '',
    plannedQty: '',
    plannedCycleSeconds: '',
    plannedSetupMinutes: '0',
    plannedStart: isoToDatetimeLocal(draft.plannedStart),
    plannedEnd: isoToDatetimeLocal(draft.plannedEnd),
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createEntry.mutateAsync({
        dailyScheduleId: scheduleId,
        cncMachineId: draft.machineId,
        workOrderId: form.workOrderId,
        productionOrderId: form.productionOrderId,
        partName: form.partName,
        plannedQty: parseInt(form.plannedQty, 10),
        plannedCycleSeconds: parseInt(form.plannedCycleSeconds, 10),
        plannedSetupMinutes: parseInt(form.plannedSetupMinutes, 10) || 0,
        plannedStart: new Date(form.plannedStart).toISOString(),
        plannedEnd: new Date(form.plannedEnd).toISOString(),
        notes: form.notes || undefined,
        sortOrder: 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('conflictError'));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t('title')}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <form onSubmit={(e) => { void handleSubmit(e); }} className="grid grid-cols-2 gap-3">
          <Field label={t('workOrderId')} required>
            <input
              value={form.workOrderId}
              onChange={(e) => set('workOrderId', e.target.value)}
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('productionOrderId')} required>
            <input
              value={form.productionOrderId}
              onChange={(e) => set('productionOrderId', e.target.value)}
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('partName')} required className="col-span-2">
            <input
              value={form.partName}
              onChange={(e) => set('partName', e.target.value)}
              required
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('plannedStart')}>
            <input
              type="datetime-local"
              value={form.plannedStart}
              onChange={(e) => set('plannedStart', e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('plannedEnd')}>
            <input
              type="datetime-local"
              value={form.plannedEnd}
              onChange={(e) => set('plannedEnd', e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('plannedQty')} required>
            <input
              type="number"
              min="1"
              value={form.plannedQty}
              onChange={(e) => set('plannedQty', e.target.value)}
              required
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('plannedCycleSeconds')} required>
            <input
              type="number"
              min="1"
              value={form.plannedCycleSeconds}
              onChange={(e) => set('plannedCycleSeconds', e.target.value)}
              required
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('plannedSetupMinutes')}>
            <input
              type="number"
              min="0"
              value={form.plannedSetupMinutes}
              onChange={(e) => set('plannedSetupMinutes', e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
          <Field label={t('notes')} className="col-span-2">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={INPUT_CLS}
            />
          </Field>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={createEntry.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createEntry.isPending ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── EntryDetailPanel ──────────────────────────────────────────────────────────

function EntryDetailPanel({
  entryId,
  onClose,
}: {
  entryId: string;
  onClose: () => void;
}) {
  const t = useTranslations('cnc.planning.entryDetail');
  const tEntries = useTranslations('cnc.entries');

  const { data: entry, isLoading } = useScheduleEntry(entryId);
  const { data: logs = [] } = useProductionLogs(entryId);
  const advanceStatus = useAdvanceEntryStatus();
  const createLog = useCreateProductionLog();

  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ completedQty: '', scrapQty: '0', operatorNotes: '' });

  if (isLoading || !entry) {
    return (
      <div className="flex w-80 shrink-0 flex-col rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const nextStatuses = VALID_TRANSITIONS[entry.status];

  function handleAdvance(status: ScheduleEntryStatus) {
    advanceStatus.mutate({ id: entryId, body: { status } });
  }

  function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    createLog.mutate(
      {
        scheduleEntryId: entryId,
        completedQty: parseInt(logForm.completedQty, 10),
        scrapQty: parseInt(logForm.scrapQty, 10) || 0,
        operatorNotes: logForm.operatorNotes || undefined,
      },
      {
        onSuccess: () => {
          setLogForm({ completedQty: '', scrapQty: '0', operatorNotes: '' });
          setShowLogForm(false);
        },
      },
    );
  }

  return (
    <div className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold leading-tight">{entry.partName}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ENTRY_COLORS[entry.status]}`}
          >
            {tEntries(`status.${entry.status}` as Parameters<typeof tEntries>[0])}
          </span>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Timing & progress */}
      <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('start')}</span>
          <span>{new Date(entry.plannedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('end')}</span>
          <span>{new Date(entry.plannedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('progress')}</span>
          <span>
            {entry.cumulativeCompletedQty} / {entry.plannedQty}
            <span className="ml-1 text-muted-foreground">({entry.progressPct}%)</span>
          </span>
        </div>
        {entry.overrun && (
          <p className="text-xs font-medium text-red-600">{t('overrun')}</p>
        )}
      </div>

      {/* Advance status */}
      {nextStatuses.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('advanceStatus')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {nextStatuses.map((s) => (
              <button
                key={s}
                type="button"
                disabled={advanceStatus.isPending}
                onClick={() => handleAdvance(s)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${ENTRY_COLORS[s]}`}
              >
                <ChevronRight className="h-3 w-3" />
                {tEntries(`status.${s}` as Parameters<typeof tEntries>[0])}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Production logs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('logs')}
          </p>
          {entry.status === ScheduleEntryStatus.RUNNING && !showLogForm && (
            <button
              type="button"
              onClick={() => setShowLogForm(true)}
              className="rounded-md border px-2 py-0.5 text-xs font-medium hover:bg-muted"
            >
              {t('addLog')}
            </button>
          )}
        </div>

        {showLogForm && (
          <form
            onSubmit={handleLogSubmit}
            className="space-y-2 rounded-md border p-3"
          >
            <div>
              <label className="text-xs font-medium">{t('logQty')} *</label>
              <input
                type="number"
                min="1"
                required
                value={logForm.completedQty}
                onChange={(e) => setLogForm((p) => ({ ...p, completedQty: e.target.value }))}
                className="mt-0.5 w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium">{t('logScrap')}</label>
              <input
                type="number"
                min="0"
                value={logForm.scrapQty}
                onChange={(e) => setLogForm((p) => ({ ...p, scrapQty: e.target.value }))}
                className="mt-0.5 w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createLog.isPending}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {createLog.isPending ? t('submitting') : t('submitLog')}
              </button>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        )}

        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t('noLogs')}</p>
        ) : (
          <div className="space-y-1">
            {(logs as ProductionLogResponse[]).map((log) => (
              <div
                key={log.id}
                className="flex justify-between rounded bg-muted/50 px-2 py-1 text-xs"
              >
                <span className="text-muted-foreground">
                  {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>
                  +{log.completedQty}
                  {log.scrapQty > 0 && (
                    <span className="ml-1 text-red-500">−{log.scrapQty} scrap</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── GanttRow ──────────────────────────────────────────────────────────────────

interface RowDragState {
  startX: number;
  currentX: number;
}

function GanttRow({
  machine,
  entries,
  date,
  scheduleExists,
  selectedEntryId,
  onEntrySelect,
  onNewEntry,
}: {
  machine: CncMachineResponse;
  entries: ScheduleEntryResponse[];
  date: string;
  scheduleExists: boolean;
  selectedEntryId: string | null;
  onEntrySelect: (id: string) => void;
  onNewEntry: (draft: NewEntryDraft) => void;
}) {
  const [dragState, setDragState] = useState<RowDragState | null>(null);

  const machineEntries = entries.filter((e) => e.cncMachineId === machine.id);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!scheduleExists) return;
    // Only react to clicks directly on the row background (not on child entry bars)
    if ((e.target as HTMLElement) !== e.currentTarget) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, TOTAL_W));
    setDragState({ startX: x, currentX: x });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, TOTAL_W));
    setDragState((prev) => (prev ? { ...prev, currentX: x } : null));
  }

  function handlePointerUp() {
    if (!dragState) return;

    const rawStart = Math.min(dragState.startX, dragState.currentX);
    const rawEnd = Math.max(dragState.startX, dragState.currentX);
    const isClick = rawEnd - rawStart < HOUR_PX / 4;

    const snappedStart = snapX(rawStart);
    const snappedEnd = isClick
      ? snappedStart + HOUR_PX           // click → 1-hour default
      : snapX(rawEnd);

    setDragState(null);
    onNewEntry({
      machineId: machine.id,
      plannedStart: xToIso(snappedStart, date),
      plannedEnd: xToIso(Math.max(snappedEnd, snappedStart + HOUR_PX / 4), date),
    });
  }

  const ghostLeft = dragState ? Math.min(dragState.startX, dragState.currentX) : 0;
  const ghostWidth = dragState ? Math.abs(dragState.currentX - dragState.startX) : 0;

  return (
    <div className="flex border-b last:border-b-0">
      {/* Machine label */}
      <div
        style={{ width: LABEL_W, flexShrink: 0 }}
        className="flex flex-col justify-center gap-0.5 border-r px-3 py-2"
      >
        <p className="truncate text-sm font-medium">{machine.name}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">{machine.code}</p>
      </div>

      {/* Timeline area */}
      <div
        style={{ width: TOTAL_W, height: ROW_H, position: 'relative' }}
        className={scheduleExists ? 'cursor-crosshair' : 'cursor-not-allowed'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragState(null)}
      >
        {/* Hour grid lines */}
        {Array.from({ length: HOURS + 1 }, (_, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: i * HOUR_PX, top: 0, bottom: 0 }}
            className="pointer-events-none border-l border-border/30"
          />
        ))}

        {/* Ghost selection rect */}
        {dragState && ghostWidth > 4 && (
          <div
            style={{
              position: 'absolute',
              left: ghostLeft,
              width: ghostWidth,
              top: 4,
              bottom: 4,
              pointerEvents: 'none',
              zIndex: 10,
            }}
            className="rounded border border-primary/60 bg-primary/15"
          />
        )}

        {/* Entry bars */}
        {machineEntries.map((entry) => (
          <EntryBar
            key={entry.id}
            entry={entry}
            isSelected={selectedEntryId === entry.id}
            onSelect={onEntrySelect}
          />
        ))}
      </div>
    </div>
  );
}

// ── CncGanttChart ─────────────────────────────────────────────────────────────

export function CncGanttChart() {
  const t = useTranslations('cnc.planning');
  const tSchedules = useTranslations('cnc.schedules');

  const [date, setDate] = useState(todayLocalDate);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [newEntryDraft, setNewEntryDraft] = useState<NewEntryDraft | null>(null);

  useCncWebSocket();

  const { data: machines = [], isLoading: machinesLoading } = useCncMachines();
  const { data: schedule, isLoading: scheduleLoading } = useDailyScheduleByDate(date);
  const { data: entries = [] } = useScheduleEntries(schedule?.id ?? '');
  const createSchedule = useCreateDailySchedule();
  const updateEntry = useUpdateScheduleEntry();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd({ active, delta }: DragEndEvent) {
    const data = active.data.current as { entry?: ScheduleEntryResponse } | undefined;
    if (!data?.entry || Math.abs(delta.x) < 4) return;

    const entry = data.entry;
    const snapMs = 15 * 60 * 1000;
    const deltaMs = (delta.x / HOUR_PX) * 3_600_000;
    const origStart = new Date(entry.plannedStart).getTime();
    const duration = new Date(entry.plannedEnd).getTime() - origStart;
    const newStart = Math.round((origStart + deltaMs) / snapMs) * snapMs;

    updateEntry.mutate({
      id: entry.id,
      body: {
        plannedStart: new Date(newStart).toISOString(),
        plannedEnd: new Date(newStart + duration).toISOString(),
      },
    });
  }

  const isLoading = machinesLoading || scheduleLoading;

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDate(e.target.value);
    setSelectedEntryId(null);
    setNewEntryDraft(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{t('title')}</h1>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {schedule && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
            {tSchedules(`status.${schedule.status}` as Parameters<typeof tSchedules>[0])}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{t('dragToPlace')}</span>
      </div>

      {/* No schedule prompt */}
      {!isLoading && !schedule && (
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{t('noSchedule')}</p>
          <button
            type="button"
            disabled={createSchedule.isPending}
            onClick={() => createSchedule.mutate({ scheduleDate: date, shiftCount: 1 })}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createSchedule.isPending ? t('creatingSchedule') : t('createSchedule')}
          </button>
        </div>
      )}

      {/* Main panel */}
      {(isLoading || machines.length > 0) && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4">
            {/* Gantt grid */}
            <div className="flex-1 overflow-x-auto rounded-lg border">
              {isLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div style={{ minWidth: LABEL_W + TOTAL_W }}>
                  {/* Hour header */}
                  <div className="flex border-b bg-muted/50">
                    <div
                      style={{ width: LABEL_W, flexShrink: 0 }}
                      className="border-r px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                      {t('machine')}
                    </div>
                    <div style={{ width: TOTAL_W, position: 'relative', height: 32 }}>
                      {Array.from({ length: HOURS + 1 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            position: 'absolute',
                            left: i * HOUR_PX,
                            transform: 'translateX(-50%)',
                            top: '50%',
                            marginTop: '-0.5em',
                          }}
                          className="text-[10px] font-medium text-muted-foreground"
                        >
                          {String(GANTT_START_H + i).padStart(2, '0')}:00
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Machine rows */}
                  {machines.map((machine) => (
                    <GanttRow
                      key={machine.id}
                      machine={machine}
                      entries={entries as ScheduleEntryResponse[]}
                      date={date}
                      scheduleExists={!!schedule}
                      selectedEntryId={selectedEntryId}
                      onEntrySelect={setSelectedEntryId}
                      onNewEntry={setNewEntryDraft}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Entry detail panel */}
            {selectedEntryId && (
              <EntryDetailPanel
                entryId={selectedEntryId}
                onClose={() => setSelectedEntryId(null)}
              />
            )}
          </div>
        </DndContext>
      )}

      {/* New entry modal */}
      {newEntryDraft && schedule && (
        <NewEntryModal
          scheduleId={schedule.id}
          draft={newEntryDraft}
          onClose={() => setNewEntryDraft(null)}
        />
      )}
    </div>
  );
}
