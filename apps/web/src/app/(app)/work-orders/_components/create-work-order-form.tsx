'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateWorkOrder, useCreateWorkOrderFromRouting } from '@/hooks/use-work-orders';

interface StepRow {
  stepNumber: number;
  name: string;
  estimatedMinutes: string;
  requiredSkills: string;
}

export function CreateWorkOrderForm() {
  const t = useTranslations('workOrders');
  const router = useRouter();
  const createWO = useCreateWorkOrder();
  const createFromRouting = useCreateWorkOrderFromRouting();

  const [mode, setMode] = useState<'routing' | 'manual'>('routing');
  const [code, setCode] = useState('');
  const [productionOrderId, setProductionOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [steps, setSteps] = useState<StepRow[]>([
    { stepNumber: 1, name: '', estimatedMinutes: '', requiredSkills: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, name: '', estimatedMinutes: '', requiredSkills: '' },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })),
    );
  }

  function updateStep(index: number, field: keyof StepRow, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const base = {
      code,
      productionOrderId,
      description: description || undefined,
      plannedStartDate: new Date(plannedStartDate).toISOString(),
      plannedEndDate: new Date(plannedEndDate).toISOString(),
      steps: [] as {
        stepNumber: number;
        name: string;
        estimatedMinutes?: number;
        requiredSkills: string[];
      }[],
      factoryId: '', // filled server-side via route param
    };

    try {
      if (mode === 'routing') {
        await createFromRouting.mutateAsync({ productionOrderId, body: base });
      } else {
        base.steps = steps.map((s) => ({
          stepNumber: s.stepNumber,
          name: s.name,
          estimatedMinutes: s.estimatedMinutes ? Number(s.estimatedMinutes) : undefined,
          requiredSkills: s.requiredSkills
            ? s.requiredSkills.split(',').map((sk) => sk.trim()).filter(Boolean)
            : [],
        }));
        await createWO.mutateAsync(base);
      }
      router.push('/work-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  const isPending = createWO.isPending || createFromRouting.isPending;

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="rounded-md border bg-card p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('form.code')} *</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="WO-2026-001"
              className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('form.productionOrderId')} *</label>
            <input
              required
              value={productionOrderId}
              onChange={(e) => setProductionOrderId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="h-9 w-full rounded-md border bg-background px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('form.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('form.plannedStartDate')} *</label>
            <input
              required
              type="datetime-local"
              value={plannedStartDate}
              onChange={(e) => setPlannedStartDate(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('form.plannedEndDate')} *</label>
            <input
              required
              type="datetime-local"
              value={plannedEndDate}
              onChange={(e) => setPlannedEndDate(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Step mode */}
      <div className="rounded-md border bg-card p-6 space-y-4">
        <p className="text-sm font-medium">{t('form.modeLabel')}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="routing"
              checked={mode === 'routing'}
              onChange={() => setMode('routing')}
              className="accent-primary"
            />
            <span className="text-sm">{t('form.modeFromRouting')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="manual"
              checked={mode === 'manual'}
              onChange={() => setMode('manual')}
              className="accent-primary"
            />
            <span className="text-sm">{t('form.modeManual')}</span>
          </label>
        </div>

        {/* Manual steps */}
        {mode === 'manual' && (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-md border bg-muted/30 p-3 sm:grid-cols-[3rem_1fr_6rem_1fr_auto]"
              >
                <div className="flex items-center">
                  <span className="text-sm font-mono text-muted-foreground">#{step.stepNumber}</span>
                </div>
                <input
                  required
                  value={step.name}
                  onChange={(e) => updateStep(i, 'name', e.target.value)}
                  placeholder={t('form.stepName')}
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="number"
                  min="1"
                  value={step.estimatedMinutes}
                  onChange={(e) => updateStep(i, 'estimatedMinutes', e.target.value)}
                  placeholder={t('form.estimatedMinutes')}
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  value={step.requiredSkills}
                  onChange={(e) => updateStep(i, 'requiredSkills', e.target.value)}
                  placeholder="skill-a, skill-b"
                  className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="h-9 rounded-md px-2 text-sm text-muted-foreground hover:text-red-600"
                  >
                    {t('form.removeStep')}
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addStep}
              className="text-sm text-primary hover:underline"
            >
              + {t('form.addStep')}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/work-orders')}
          className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Creating…' : t('actions.createSubmit')}
        </button>
      </div>
    </form>
  );
}
