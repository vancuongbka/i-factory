'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MovementsLog } from '../../_components/movements-log';
import { RecordMovementModal } from '../../_components/record-movement-modal';

export function MovementsPageClient() {
  const t = useTranslations('inventory.movements');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/inventory/materials"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Materials
        </Link>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('actions.record')}
        </button>
      </div>
      <MovementsLog />
      {showModal && <RecordMovementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
