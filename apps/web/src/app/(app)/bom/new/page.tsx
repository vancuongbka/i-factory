import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateBomForm } from '../_components/create-bom-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bom');
  return { title: t('pageTitle') };
}

export default async function NewBomPage() {

  return (
    <div className="space-y-4">
      <CreateBomForm />
    </div>
  );
}
