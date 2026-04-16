'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

export function LoginForm() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Test@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">{t('username')}</label>
        <input
          type="text"
          autoComplete="username"
          className={inputClass}
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">{t('password')}</label>
        <input
          type="password"
          autoComplete="current-password"
          className={inputClass}
          placeholder="Test@123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? t('signingIn') : t('signIn')}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        {t('defaultCredentialsHint')}
      </p>
    </form>
  );
}
