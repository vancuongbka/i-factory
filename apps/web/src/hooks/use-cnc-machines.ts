'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCncMachineDto, UpdateCncMachineDto, CncMachineStatus } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useCncMachines() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-machines', factoryId],
    queryFn: () => apiClient.cnc.machines.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useCncMachine(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-machines', factoryId, id],
    queryFn: () => apiClient.cnc.machines.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCncKpiSummary(date: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-kpi', factoryId, date],
    queryFn: () => apiClient.cnc.machines.kpiSummary(factoryId!, date),
    enabled: !!factoryId && !!date,
    refetchInterval: 30_000,
  });
}

export function useCreateCncMachine() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCncMachineDto) =>
      apiClient.cnc.machines.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
    },
  });
}

export function useUpdateCncMachine() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCncMachineDto }) =>
      apiClient.cnc.machines.update(factoryId!, id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId, id] });
    },
  });
}

export function useDeleteCncMachine() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.cnc.machines.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
    },
  });
}

export function useUpdateCncMachineStatus() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CncMachineStatus }) =>
      apiClient.cnc.machines.updateStatus(factoryId!, id, status),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId, id] });
    },
  });
}
