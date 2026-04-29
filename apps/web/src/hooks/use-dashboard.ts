'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useDashboard() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['dashboard', factoryId],
    queryFn: () => apiClient.dashboard.get(factoryId!),
    enabled: !!factoryId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
