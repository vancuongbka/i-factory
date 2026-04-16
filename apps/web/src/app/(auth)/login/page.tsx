import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { IFactoryLogo } from '@/components/icons/ifactory-logo';
import { LoginForm } from './_components/login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('pageTitle') };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <IFactoryLogo className="h-16 w-16 text-primary" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">iFactory</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('signInSubtitle')}</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
