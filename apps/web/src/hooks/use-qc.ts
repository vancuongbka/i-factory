'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateQCInspectionDto,
  UpdateQCInspectionDto,
  CreateDefectDto,
} from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useInspections() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['qc-inspections', factoryId],
    queryFn: () => apiClient.qc.inspections.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useInspection(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['qc-inspections', factoryId, id],
    queryFn: () => apiClient.qc.inspections.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateInspection() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateQCInspectionDto, 'factoryId'>) =>
      apiClient.qc.inspections.create(factoryId!, { ...body, factoryId: factoryId! }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId] });
    },
  });
}

export function useUpdateInspection() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateQCInspectionDto }) =>
      apiClient.qc.inspections.update(factoryId!, id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId, id] });
    },
  });
}

export function useDeleteInspection() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.qc.inspections.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId] });
    },
  });
}

export function useAddDefect() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inspectionId,
      body,
    }: {
      inspectionId: string;
      body: Omit<CreateDefectDto, 'factoryId' | 'inspectionId'>;
    }) =>
      apiClient.qc.inspections.addDefect(factoryId!, inspectionId, {
        ...body,
        factoryId: factoryId!,
        inspectionId,
      }),
    onSuccess: (_data, { inspectionId }) => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId, inspectionId] });
    },
  });
}

export function useApproveInspection() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.qc.inspections.approve(factoryId!, id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId, id] });
    },
  });
}

export function useRejectInspection() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.qc.inspections.reject(factoryId!, id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['qc-inspections', factoryId, id] });
    },
  });
}
