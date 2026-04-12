'use client';

import { useTranslations } from 'next-intl';
import { UserRole } from '@i-factory/api-types';
import { useUsers, useDeleteUser } from '@/hooks/use-users';

const ROLE_STYLES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:         'bg-purple-100 text-purple-700',
  [UserRole.FACTORY_ADMIN]:       'bg-blue-100 text-blue-700',
  [UserRole.PRODUCTION_MANAGER]:  'bg-yellow-100 text-yellow-800',
  [UserRole.QC_INSPECTOR]:        'bg-green-100 text-green-700',
  [UserRole.WAREHOUSE_STAFF]:     'bg-orange-100 text-orange-700',
  [UserRole.OPERATOR]:            'bg-gray-100 text-gray-700',
  [UserRole.VIEWER]:              'bg-gray-100 text-gray-400',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function UsersTable() {
  const t = useTranslations('users');
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!users?.length) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('columns.fullName')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.username')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.email')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.role')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.status')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('columns.createdAt')}</th>
            <th className="px-4 py-3 text-right font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{user.fullName}</td>
              <td className="px-4 py-3 font-mono text-xs">{user.username}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    ROLE_STYLES[user.role]
                  }
                >
                  {t(`role.${user.role}` as Parameters<typeof t>[0])}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    (user.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600')
                  }
                >
                  {user.isActive ? t('status.active') : t('status.inactive')}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete user ${user.username}?`)) {
                      deleteMutation.mutate(user.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-destructive hover:underline disabled:opacity-50"
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
