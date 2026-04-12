'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateMaterialDto, UpdateMaterialDto, CreateStockMovementDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

// ── Materials ───────────────────────────────────────────────────────────────

export function useMaterials() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['materials', factoryId],
    queryFn: () => apiClient.inventory.materials.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useMaterial(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['materials', factoryId, id],
    queryFn: () => apiClient.inventory.materials.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useLowStockMaterials() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['materials-low-stock', factoryId],
    queryFn: () => apiClient.inventory.materials.lowStock(factoryId!),
    enabled: !!factoryId,
  });
}

export function useCreateMaterial() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateMaterialDto, 'factoryId'>) =>
      apiClient.inventory.materials.create(factoryId!, { ...body, factoryId: factoryId! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId] });
    },
  });
}

export function useUpdateMaterial() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMaterialDto }) =>
      apiClient.inventory.materials.update(factoryId!, id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId, id] });
    },
  });
}

export function useDeleteMaterial() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.inventory.materials.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId] });
    },
  });
}

// ── Movements ───────────────────────────────────────────────────────────────

export function useMovements(materialId?: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['movements', factoryId, materialId ?? 'all'],
    queryFn: () => apiClient.inventory.movements.list(factoryId!, materialId),
    enabled: !!factoryId,
  });
}

export function useRecordMovement() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateStockMovementDto, 'factoryId'>) =>
      apiClient.inventory.movements.record(factoryId!, { ...body, factoryId: factoryId! }),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({ queryKey: ['movements', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['materials', factoryId, body.materialId] });
    },
  });
}
