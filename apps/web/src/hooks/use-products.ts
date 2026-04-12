'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProductDto, UpdateProductDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useProducts() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['products', factoryId],
    queryFn: () => apiClient.masterData.products.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useProduct(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['products', factoryId, id],
    queryFn: () => apiClient.masterData.products.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateProduct() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductDto) => apiClient.masterData.products.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', factoryId] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductDto) => apiClient.masterData.products.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', factoryId] });
    },
  });
}

export function useDeleteProduct() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.products.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', factoryId] });
    },
  });
}
