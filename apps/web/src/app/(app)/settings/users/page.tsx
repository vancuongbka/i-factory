import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('users');
  return { title: t('pageTitle') };
}

export default async function UsersSettingsPage() {
  const t = await getTranslations('users');

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('title')}</h1>
    </div>
  );
}
