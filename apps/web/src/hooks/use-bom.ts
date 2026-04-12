'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateBomV2Dto, UpdateBomV2Dto, AddBomItemDto, CreateBomRevisionDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useBoms() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['bom', factoryId],
    queryFn: () => apiClient.bom.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useBom(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['bom', factoryId, id],
    queryFn: () => apiClient.bom.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateBom() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBomV2Dto) => apiClient.bom.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId] });
    },
  });
}

export function useUpdateBom(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBomV2Dto) => apiClient.bom.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId, id] });
    },
  });
}

export function useDeleteBom() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.bom.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId] });
    },
  });
}

export function useAddBomItem(bomId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddBomItemDto) => apiClient.bom.addItem(factoryId!, bomId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId, bomId] });
    },
  });
}

export function useUpdateBomItem(bomId: string, itemId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AddBomItemDto>) =>
      apiClient.bom.updateItem(factoryId!, bomId, itemId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId, bomId] });
    },
  });
}

export function useRemoveBomItem(bomId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => apiClient.bom.removeItem(factoryId!, bomId, itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId, bomId] });
    },
  });
}

export function useBomRevisions(bomId: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['bom-revisions', factoryId, bomId],
    queryFn: () => apiClient.bom.revisions(factoryId!, bomId),
    enabled: !!factoryId && !!bomId,
  });
}

export function useCreateBomRevision(bomId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBomRevisionDto) => apiClient.bom.revise(factoryId!, bomId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bom-revisions', factoryId, bomId] });
      void queryClient.invalidateQueries({ queryKey: ['bom', factoryId, bomId] });
    },
  });
}
