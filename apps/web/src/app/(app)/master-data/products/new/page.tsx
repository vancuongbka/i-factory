import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CreateProductForm } from '../_components/create-product-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.products');
  return { title: t('pageTitle') };
}

export default async function NewProductPage() {

  return (
    <div className="space-y-4">
      <CreateProductForm />
    </div>
  );
}
