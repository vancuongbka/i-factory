'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdvanceEntryStatusDto,
  CreateCncDowntimeDto,
  CreateDailyScheduleDto,
  CreateProductionLogDto,
  CreateScheduleEntryDto,
  ReorderScheduleEntriesDto,
  ResolveCncDowntimeDto,
  UpdateDailyScheduleDto,
  UpdateScheduleEntryDto,
} from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

// ── Daily Schedules ──────────────────────────────────────────────────────────

export function useDailySchedules() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-schedules', factoryId],
    queryFn: () => apiClient.cnc.schedules.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useDailySchedule(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-schedules', factoryId, id],
    queryFn: () => apiClient.cnc.schedules.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useDailyScheduleByDate(date: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-schedules', factoryId, 'date', date],
    queryFn: () => apiClient.cnc.schedules.byDate(factoryId!, date),
    enabled: !!factoryId && !!date,
  });
}

export function useCreateDailySchedule() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDailyScheduleDto) =>
      apiClient.cnc.schedules.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-schedules', factoryId] });
    },
  });
}

export function useUpdateDailySchedule() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDailyScheduleDto }) =>
      apiClient.cnc.schedules.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-schedules', factoryId] });
    },
  });
}

export function usePublishDailySchedule() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.cnc.schedules.publish(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-schedules', factoryId] });
    },
  });
}

export function useDeleteDailySchedule() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.cnc.schedules.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-schedules', factoryId] });
    },
  });
}

// ── Schedule Entries ─────────────────────────────────────────────────────────

export function useScheduleEntries(scheduleId: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-entries', factoryId, scheduleId],
    queryFn: () => apiClient.cnc.entries.listBySchedule(factoryId!, scheduleId),
    enabled: !!factoryId && !!scheduleId,
  });
}

export function useScheduleEntry(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-entries', factoryId, 'detail', id],
    queryFn: () => apiClient.cnc.entries.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateScheduleEntry() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScheduleEntryDto) =>
      apiClient.cnc.entries.create(factoryId!, body),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({
        queryKey: ['cnc-entries', factoryId, body.dailyScheduleId],
      });
    },
  });
}

export function useUpdateScheduleEntry() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateScheduleEntryDto }) =>
      apiClient.cnc.entries.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
    },
  });
}

export function useDeleteScheduleEntry() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.cnc.entries.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
    },
  });
}

export function useAdvanceEntryStatus() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdvanceEntryStatusDto }) =>
      apiClient.cnc.entries.advanceStatus(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
    },
  });
}

export function useReorderScheduleEntries() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderScheduleEntriesDto) =>
      apiClient.cnc.entries.reorder(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
    },
  });
}

// ── Production Logs ──────────────────────────────────────────────────────────

export function useProductionLogs(entryId: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-logs', factoryId, entryId],
    queryFn: () => apiClient.cnc.productionLogs.listByEntry(factoryId!, entryId),
    enabled: !!factoryId && !!entryId,
  });
}

export function useCreateProductionLog() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductionLogDto) =>
      apiClient.cnc.productionLogs.create(factoryId!, body),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({
        queryKey: ['cnc-logs', factoryId, body.scheduleEntryId],
      });
      void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
    },
  });
}

// ── Machine Downtime ─────────────────────────────────────────────────────────

export function useActiveDowntime() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-downtime', factoryId, 'active'],
    queryFn: () => apiClient.cnc.downtime.active(factoryId!),
    enabled: !!factoryId,
    refetchInterval: 60_000,
  });
}

export function useMachineDowntime(machineId: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['cnc-downtime', factoryId, machineId],
    queryFn: () => apiClient.cnc.downtime.listByMachine(factoryId!, machineId),
    enabled: !!factoryId && !!machineId,
  });
}

export function useRaiseDowntime() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCncDowntimeDto) =>
      apiClient.cnc.downtime.raise(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-downtime', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
    },
  });
}

export function useResolveDowntime() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ResolveCncDowntimeDto }) =>
      apiClient.cnc.downtime.resolve(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cnc-downtime', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
    },
  });
}
