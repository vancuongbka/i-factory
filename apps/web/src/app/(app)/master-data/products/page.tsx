import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ProductTable } from './_components/product-table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.products');
  return { title: t('pageTitle') };
}

export default async function ProductsPage() {
  const t = await getTranslations('masterData.products');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link
          href="/master-data/products/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('actions.create')}
        </Link>
      </div>
      <ProductTable />
    </div>
  );
}
