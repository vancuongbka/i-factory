import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateInspectionForm } from '../../_components/create-inspection-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('qualityControl.inspections');
  return { title: t('new.pageTitle') };
}

export default async function NewInspectionPage() {
  const t = await getTranslations('qualityControl.inspections');
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">{t('new.title')}</h2>
      <CreateInspectionForm />
    </div>
  );
}
