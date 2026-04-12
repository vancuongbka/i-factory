'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProductType } from '@i-factory/api-types';
import { useProduct, useUpdateProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useUoms } from '@/hooks/use-uoms';

interface ProductDetailProps {
  id: string;
}

export function ProductDetail({ id }: ProductDetailProps) {
  const t = useTranslations('masterData.products');
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const { data: categories } = useCategories();
  const { data: uoms } = useUoms();
  const updateProduct = useUpdateProduct(id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.FINISHED);
  const [categoryId, setCategoryId] = useState('');
  const [uomId, setUomId] = useState('');
  const [description, setDescription] = useState('');

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!product) return <p className="text-muted-foreground">Product not found.</p>;

  const startEdit = () => {
    setName(product.name);
    setType(product.type);
    setCategoryId(product.categoryId ?? '');
    setUomId(product.uomId);
    setDescription(product.description ?? '');
    setEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct.mutate(
      { name, type, categoryId: categoryId || undefined, uomId, description: description || undefined },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        <h2 className="text-xl font-semibold">{product.sku}</h2>

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

        {updateProduct.error && (
          <p className="text-sm text-destructive">{updateProduct.error.message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateProduct.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateProduct.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
        </div>
        <button
          type="button"
          onClick={startEdit}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {t('actions.edit')}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.type')}</dt>
          <dd>{t(`types.${product.type}`)}</dd>
        </div>
        <div>
          <dt className="font-medium text-muted-foreground">{t('fields.isActive')}</dt>
          <dd className={product.isActive ? 'text-green-600' : 'text-muted-foreground'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </dd>
        </div>
        {product.description && (
          <div className="col-span-2">
            <dt className="font-medium text-muted-foreground">{t('fields.description')}</dt>
            <dd>{product.description}</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}
