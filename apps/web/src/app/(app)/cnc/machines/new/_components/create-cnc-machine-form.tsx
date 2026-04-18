'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCreateCncMachine } from '@/hooks/use-cnc-machines';

export function CreateCncMachineForm() {
  const t = useTranslations('cnc.machines');
  const router = useRouter();
  const createMutation = useCreateCncMachine();

  const [form, setForm] = useState({
    code: '',
    name: '',
    model: '',
    maxSpindleRpm: '',
    numberOfAxes: '',
  });

  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMutation.mutateAsync({
        code: form.code,
        name: form.name,
        model: form.model || undefined,
        maxSpindleRpm: form.maxSpindleRpm ? parseInt(form.maxSpindleRpm, 10) : undefined,
        numberOfAxes: form.numberOfAxes ? parseInt(form.numberOfAxes, 10) : undefined,
      });
      router.push('/cnc/machines');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 rounded-md border p-6">
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.code')} *</label>
          <input
            name="code"
            required
            value={form.code}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.name')} *</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.model')}</label>
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.maxSpindleRpm')}</label>
          <input
            name="maxSpindleRpm"
            type="number"
            min="0"
            value={form.maxSpindleRpm}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">{t('fields.numberOfAxes')}</label>
          <input
            name="numberOfAxes"
            type="number"
            min="1"
            max="10"
            value={form.numberOfAxes}
            onChange={handleChange}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t('actions.cancel')}
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {createMutation.isPending ? t('actions.creating') : t('actions.createSubmit')}
        </button>
      </div>
    </form>
  );
}
