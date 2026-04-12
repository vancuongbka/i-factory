import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('pageTitle') };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">iFactory</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('signInSubtitle')}</p>
        </div>
        {/* TODO: LoginForm client component */}
      </div>
    </div>
  );
}
