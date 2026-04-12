'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { UserRole } from '@i-factory/api-types';
import { useCreateUser } from '@/hooks/use-users';

const ALL_ROLES = Object.values(UserRole);

export function CreateUserForm() {
  const t = useTranslations('users');
  const router = useRouter();
  const createMutation = useCreateUser();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: UserRole.OPERATOR,
    allowedFactories: '',
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allowedFactories = form.allowedFactories
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await createMutation.mutateAsync({
      username: form.username,
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role,
      allowedFactories,
    });
    router.push('/settings/users');
  }

  const inputClass =
    'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
  const labelClass = 'block text-sm font-medium mb-1';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('form.fullName')} *</label>
          <input className={inputClass} value={form.fullName} onChange={set('fullName')} required />
        </div>
        <div>
          <label className={labelClass}>{t('form.username')} *</label>
          <input
            className={inputClass}
            value={form.username}
            onChange={set('username')}
            required
            minLength={3}
            maxLength={50}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('form.email')} *</label>
        <input
          type="email"
          className={inputClass}
          value={form.email}
          onChange={set('email')}
          required
        />
      </div>

      <div>
        <label className={labelClass}>{t('form.password')} *</label>
        <input
          type="password"
          className={inputClass}
          value={form.password}
          onChange={set('password')}
          required
          minLength={8}
        />
      </div>

      <div>
        <label className={labelClass}>{t('form.role')} *</label>
        <select
          className={inputClass}
          value={form.role}
          onChange={set('role')}
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`role.${r}` as Parameters<typeof t>[0])}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{t('form.allowedFactories')}</label>
        <input
          className={inputClass}
          value={form.allowedFactories}
          onChange={set('allowedFactories')}
          placeholder="Leave empty for single-factory access"
        />
      </div>

      {createMutation.error && (
        <p className="text-sm text-destructive">{createMutation.error.message}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Saving…' : t('actions.createSubmit')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
