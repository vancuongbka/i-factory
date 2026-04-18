import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateCncMachineForm } from './_components/create-cnc-machine-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('cnc.machines.new');
  return { title: t('pageTitle') };
}

export default async function NewCncMachinePage() {
  const t = await getTranslations('cnc.machines.new');
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">{t('title')}</h1>
      <CreateCncMachineForm />
    </div>
  );
}
