import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CategoryTree } from './_components/category-tree';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.categories');
  return { title: t('pageTitle') };
}

export default async function CategoriesPage() {

  return (
    <div className="space-y-4">
      <CategoryTree />
    </div>
  );
}
