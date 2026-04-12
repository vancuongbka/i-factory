'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import type { ProductType } from '@i-factory/api-types';

export function ProductTable() {
  const t = useTranslations('masterData.products');
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const router = useRouter();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (!products?.length) {
    return <p className="text-muted-foreground">No products found. Create one to get started.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('fields.sku')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.type')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('fields.isActive')}</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-mono">{product.sku}</td>
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {t(`types.${product.type as ProductType}`)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={product.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => router.push(`/master-data/products/${product.id}`)}
                  className="mr-2 text-sm text-primary hover:underline"
                >
                  {t('actions.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete product "${product.name}"?`)) {
                      deleteProduct.mutate(product.id);
                    }
                  }}
                  className="text-sm text-destructive hover:underline"
                >
                  {t('actions.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
