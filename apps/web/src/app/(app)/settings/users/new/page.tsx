import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateUserForm } from '../_components/create-user-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('users');
  return { title: t('new.pageTitle') };
}

export default async function NewUserPage() {
  const t = await getTranslations('users');
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">{t('new.title')}</h2>
      <CreateUserForm />
    </div>
  );
}
