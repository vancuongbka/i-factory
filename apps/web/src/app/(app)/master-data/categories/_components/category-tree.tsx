'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/use-categories';
import { useFactory } from '@/hooks/use-factory';

export function CategoryTree() {
  const t = useTranslations('masterData.categories');
  const { factoryId } = useFactory();
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createCategory.mutate(
      { factoryId, code, name, sortOrder: 0, parentId: parentId || undefined, description: description || undefined },
      { onSuccess: () => { setShowForm(false); setCode(''); setName(''); setParentId(''); setDescription(''); } },
    );
  };

  // Build flat list grouped by parentId for simple display
  const roots = categories?.filter((c) => !c.parentId) ?? [];
  const children = (parentId: string) => categories?.filter((c) => c.parentId === parentId) ?? [];

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t('actions.create')}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="max-w-md space-y-3 rounded-md border p-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.code')}</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
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
            <label className="text-sm font-medium">{t('fields.parent')}</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">— None (root) —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.description')}</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          {createCategory.error && (
            <p className="text-sm text-destructive">{createCategory.error.message}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createCategory.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {createCategory.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {roots.length === 0 && !showForm && (
        <p className="text-muted-foreground">No categories yet.</p>
      )}

      <ul className="space-y-1">
        {roots.map((root) => (
          <li key={root.id} className="rounded-md border">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-medium">{root.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{root.code}</span>
              <button
                type="button"
                onClick={() => { if (confirm(`Delete "${root.name}"?`)) deleteCategory.mutate(root.id); }}
                className="ml-4 text-xs text-destructive hover:underline"
              >
                {t('actions.delete')}
              </button>
            </div>
            {children(root.id).length > 0 && (
              <ul className="ml-6 border-l pb-2">
                {children(root.id).map((child) => (
                  <li key={child.id} className="flex items-center justify-between px-4 py-1.5 text-sm">
                    <span>{child.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{child.code}</span>
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Delete "${child.name}"?`)) deleteCategory.mutate(child.id); }}
                      className="ml-4 text-xs text-destructive hover:underline"
                    >
                      {t('actions.delete')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
