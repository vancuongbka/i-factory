import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateProductForm } from '../_components/create-product-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.products.new');
  return { title: t('pageTitle') };
}

export default async function NewProductPage() {
  const t = await getTranslations('masterData.products.new');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <CreateProductForm />
    </div>
  );
}
