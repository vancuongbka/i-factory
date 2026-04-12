'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProductionOrderDto, UpdateProductionOrderDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useProductionOrders() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['production-orders', factoryId],
    queryFn: () => apiClient.production.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useProductionOrder(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['production-orders', factoryId, id],
    queryFn: () => apiClient.production.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateProductionOrder() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateProductionOrderDto, 'factoryId'>) =>
      apiClient.production.create(factoryId!, { ...body, factoryId: factoryId! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['production-orders', factoryId] });
    },
  });
}

export function useUpdateProductionOrder() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductionOrderDto }) =>
      apiClient.production.update(factoryId!, id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['production-orders', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['production-orders', factoryId, id] });
    },
  });
}

export function useDeleteProductionOrder() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.production.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['production-orders', factoryId] });
    },
  });
}
