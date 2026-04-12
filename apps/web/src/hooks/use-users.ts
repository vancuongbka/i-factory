'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateUserDto, UpdateUserDto } from '@i-factory/api-types';
import { apiClient } from '@/lib/api-client';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.users.list(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient.users.get(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserDto) => apiClient.users.create(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserDto }) =>
      apiClient.users.update(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.users.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
