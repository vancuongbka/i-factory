'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProductType } from '@i-factory/api-types';
import { useCreateProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useUoms } from '@/hooks/use-uoms';
import { useFactory } from '@/hooks/use-factory';

export function CreateProductForm() {
  const t = useTranslations('masterData.products');
  const { factoryId } = useFactory();
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: categories } = useCategories();
  const { data: uoms } = useUoms();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.FINISHED);
  const [categoryId, setCategoryId] = useState('');
  const [uomId, setUomId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createProduct.mutate(
      {
        factoryId,
        sku,
        name,
        type,
        isActive: true,
        categoryId: categoryId || undefined,
        uomId,
        description: description || undefined,
      },
      {
        onSuccess: () => router.push('/master-data/products'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.sku')}</label>
        <input
          required
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="e.g. PROD-001"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.name')}</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.type')}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ProductType)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {Object.values(ProductType).map((v) => (
            <option key={v} value={v}>
              {t(`types.${v}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.uom')}</label>
        <select
          required
          value={uomId}
          onChange={(e) => setUomId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">— Select UoM —</option>
          {uoms?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.category')}</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">— None —</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">{t('fields.description')}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {createProduct.error && (
        <p className="text-sm text-destructive">{createProduct.error.message}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={createProduct.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {createProduct.isPending ? 'Saving…' : t('actions.create')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
