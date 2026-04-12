'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateWorkCenterDto,
  UpdateWorkCenterDto,
  CreateMachineDto,
  UpdateMachineDto,
  CreateSkillDto,
  UpdateSkillDto,
} from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useWorkCenters() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['work-centers', factoryId],
    queryFn: () => apiClient.masterData.workCenters.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useWorkCenter(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['work-centers', factoryId, id],
    queryFn: () => apiClient.masterData.workCenters.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateWorkCenter() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkCenterDto) =>
      apiClient.masterData.workCenters.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-centers', factoryId] });
    },
  });
}

export function useUpdateWorkCenter(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWorkCenterDto) =>
      apiClient.masterData.workCenters.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-centers', factoryId] });
    },
  });
}

export function useDeleteWorkCenter() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.workCenters.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['work-centers', factoryId] });
    },
  });
}

// ── Machines ──────────────────────────────────────────────────────────────────

export function useMachines(workCenterId: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['machines', factoryId, workCenterId],
    queryFn: () => apiClient.masterData.machines.list(factoryId!, workCenterId),
    enabled: !!factoryId && !!workCenterId,
  });
}

export function useCreateMachine(workCenterId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMachineDto) =>
      apiClient.masterData.machines.create(factoryId!, workCenterId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['machines', factoryId, workCenterId] });
    },
  });
}

export function useUpdateMachine(workCenterId: string, machineId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMachineDto) =>
      apiClient.masterData.machines.update(factoryId!, workCenterId, machineId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['machines', factoryId, workCenterId] });
    },
  });
}

export function useDeleteMachine(workCenterId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (machineId: string) =>
      apiClient.masterData.machines.remove(factoryId!, workCenterId, machineId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['machines', factoryId, workCenterId] });
    },
  });
}

// ── Skills ────────────────────────────────────────────────────────────────────

export function useSkills() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['skills', factoryId],
    queryFn: () => apiClient.masterData.skills.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useCreateSkill() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSkillDto) => apiClient.masterData.skills.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills', factoryId] });
    },
  });
}

export function useUpdateSkill(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSkillDto) => apiClient.masterData.skills.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills', factoryId] });
    },
  });
}

export function useDeleteSkill() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.skills.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills', factoryId] });
    },
  });
}
