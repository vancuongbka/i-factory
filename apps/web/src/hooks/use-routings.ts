'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateRoutingDto,
  UpdateRoutingDto,
  CreateRoutingOperationDto,
  UpdateRoutingOperationDto,
} from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';
import { useFactory } from '@/hooks/use-factory';

export function useRoutings() {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['routings', factoryId],
    queryFn: () => apiClient.masterData.routings.list(factoryId!),
    enabled: !!factoryId,
  });
}

export function useRouting(id: string) {
  const { factoryId } = useFactory();
  return useQuery({
    queryKey: ['routings', factoryId, id],
    queryFn: () => apiClient.masterData.routings.get(factoryId!, id),
    enabled: !!factoryId && !!id,
  });
}

export function useCreateRouting() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoutingDto) => apiClient.masterData.routings.create(factoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId] });
    },
  });
}

export function useUpdateRouting(id: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateRoutingDto) =>
      apiClient.masterData.routings.update(factoryId!, id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId] });
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId, id] });
    },
  });
}

export function useDeleteRouting() {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.masterData.routings.remove(factoryId!, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId] });
    },
  });
}

export function useAddRoutingOperation(routingId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoutingOperationDto) =>
      apiClient.masterData.routings.addOperation(factoryId!, routingId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId, routingId] });
    },
  });
}

export function useUpdateRoutingOperation(routingId: string, opId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateRoutingOperationDto) =>
      apiClient.masterData.routings.updateOperation(factoryId!, routingId, opId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId, routingId] });
    },
  });
}

export function useDeleteRoutingOperation(routingId: string) {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opId: string) =>
      apiClient.masterData.routings.removeOperation(factoryId!, routingId, opId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routings', factoryId, routingId] });
    },
  });
}
