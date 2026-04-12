'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@i-factory/ui';
import { SkillLevel } from '@i-factory/api-types';
import { useSkills, useCreateSkill, useDeleteSkill } from '@/hooks/use-work-centers';
import { useFactory } from '@/hooks/use-factory';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

export function SkillsTable() {
  const t = useTranslations('masterData.skills');
  const { factoryId } = useFactory();
  const { data: skills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const deleteSkill = useDeleteSkill();
  const { openConfirm, handleConfirm, handleCancel, dialog } = useConfirmDialog();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<SkillLevel>(SkillLevel.BASIC);
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryId) return;
    createSkill.mutate(
      { factoryId, code, name, level, description: description || undefined },
      { onSuccess: () => { setShowForm(false); setCode(''); setName(''); setDescription(''); } },
    );
  };

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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.code')}</label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('fields.level')}</label>
              <select value={level} onChange={(e) => setLevel(e.target.value as SkillLevel)} className="w-full rounded-md border px-3 py-2 text-sm">
                {Object.values(SkillLevel).map((v) => (
                  <option key={v} value={v}>{t(`levels.${v}`)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.name')}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t('fields.description')}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          {createSkill.error && <p className="text-sm text-destructive">{createSkill.error.message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={createSkill.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {createSkill.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {!skills?.length && !showForm ? (
        <p className="text-muted-foreground">No skills found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('fields.code')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.level')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('fields.isActive')}</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills?.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono">{s.code}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{t(`levels.${s.level}`)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={s.isActive ? 'text-green-600' : 'text-muted-foreground'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openConfirm(`Delete skill "${s.name}"?`, () => deleteSkill.mutate(s.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog && (
        <ConfirmDialog message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
}
