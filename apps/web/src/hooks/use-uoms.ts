'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateUomDto, UpdateUomDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useUoms() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['uoms', factoryId],
    queryFn: () => apiClient.masterData.uoms.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useCreateUom() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUomDto) => apiClient.masterData.uoms.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['uoms', factoryId] });
    },
  });
}

export function useUpdateUom(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUomDto) => apiClient.masterData.uoms.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['uoms', factoryId] });
    },
  });
}

export function useDeleteUom() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.uoms.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['uoms', factoryId] });
    },
  });
}
