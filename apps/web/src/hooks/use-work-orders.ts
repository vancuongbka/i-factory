'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateWorkOrderDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useWorkOrders() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['work-orders', factoryId],
    queryFn: () => apiClient.workOrders.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useWorkOrder(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['work-orders', factoryId, id],
    queryFn: () => apiClient.workOrders.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateWorkOrder() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkOrderDto) => apiClient.workOrders.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-orders', factoryId] });
    },
  });
}

export function useCreateWorkOrderFromRouting() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productionOrderId,
      body,
    }: {
      productionOrderId: string;
      body: CreateWorkOrderDto;
    }) => apiClient.workOrders.createFromRouting(factoryId!, productionOrderId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-orders', factoryId] });
    },
  });
}
