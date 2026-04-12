'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProductCategoryDto, UpdateProductCategoryDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useCategories() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['categories', factoryId],
    queryFn: () => apiClient.masterData.categories.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useCreateCategory() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductCategoryDto) =>
      apiClient.masterData.categories.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', factoryId] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductCategoryDto) =>
      apiClient.masterData.categories.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', factoryId] });
    },
  });
}

export function useDeleteCategory() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.categories.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', factoryId] });
    },
  });
}
