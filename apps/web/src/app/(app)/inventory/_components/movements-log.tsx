'use client';

import { useTranslations } from 'next-intl';
import { MovementType } from '@i-factory/api-types';
import { useMovements } from '@/hooks/use-inventory';

const TYPE_STYLES: Record<MovementType, string> = {
  [MovementType.RECEIPT]:    'bg-green-100 text-green-700',
  [MovementType.RETURN]:     'bg-blue-100 text-blue-700',
  [MovementType.ISSUE]:      'bg-red-100 text-red-700',
  [MovementType.SCRAP]:      'bg-gray-100 text-gray-500',
  [MovementType.TRANSFER]:   'bg-orange-100 text-orange-700',
  [MovementType.ADJUSTMENT]: 'bg-yellow-100 text-yellow-800',
};

const TYPE_SIGN: Record<MovementType, string> = {
  [MovementType.RECEIPT]:    '+',
  [MovementType.RETURN]:     '+',
  [MovementType.ADJUSTMENT]: '+',
  [MovementType.ISSUE]:      '−',
  [MovementType.SCRAP]:      '−',
  [MovementType.TRANSFER]:   '−',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MovementsLog({ materialId }: { materialId?: string }) {
  const t = useTranslations('inventory.movements');
  const { data: movements, isLoading } = useMovements(materialId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!movements?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.type')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.material')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.quantity')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.unit')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.reference')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.notes')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.date')}</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((mv) => (
            <tr key={mv.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    TYPE_STYLES[mv.type]
                  }
                >
                  {t(`type.${mv.type}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {mv.materialId.slice(0, 8)}…
              </td>
              <td className={`px-4 py-3 text-right tabular-nums font-medium ${TYPE_SIGN[mv.type] === '+' ? 'text-green-600' : 'text-red-600'}`}>
                {TYPE_SIGN[mv.type]}{Number(mv.quantity).toLocaleString()}
              </td>
              <td className="px-4 py-3">{mv.unit}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {mv.referenceType
                  ? `${mv.referenceType}${mv.referenceId ? ` / ${mv.referenceId.slice(0, 8)}…` : ''}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                {mv.notes ?? '—'}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">{formatDate(mv.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
