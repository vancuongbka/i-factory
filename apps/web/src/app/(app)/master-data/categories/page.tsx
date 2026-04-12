import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CategoryTree } from './_components/category-tree';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.categories');
  return { title: t('pageTitle') };
}

export default async function CategoriesPage() {
  const t = await getTranslations('masterData.categories');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <CategoryTree />
    </div>
  );
}
