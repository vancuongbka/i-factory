import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProductDetail } from '../_components/product-detail';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('masterData.products.detail');
  return { title: t('pageTitle') };
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
