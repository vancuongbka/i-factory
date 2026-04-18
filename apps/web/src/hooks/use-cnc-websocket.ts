'use client';

import { useCallback, type MutableRefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { useWebSocket } from '@/hooks/use-websocket';
import { useFactory } from '@/hooks/use-factory';

const TOKEN_KEY = 'ifactory_token';

/**
 * Connects to the /cnc WebSocket namespace and invalidates relevant query caches
 * when CNC events arrive. Safe to mount multiple times — only one socket per component.
 */
export function useCncWebSocket(): MutableRefObject<Socket | null> {
  const { factoryId } = useFactory();
  const queryClient = useQueryClient();

  const token =
    typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) ?? '') : '';

  const onEvent = useCallback(
    (event: string, _data: unknown) => {
      switch (event) {
        case 'cnc:machine-status-updated':
          void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-kpi', factoryId] });
          break;
        case 'cnc:schedule-published':
        case 'cnc:schedule-archived':
          void queryClient.invalidateQueries({ queryKey: ['cnc-schedules', factoryId] });
          break;
        case 'cnc:entry-status-advanced':
          void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-kpi', factoryId] });
          break;
        case 'cnc:production-logged':
          void queryClient.invalidateQueries({ queryKey: ['cnc-entries', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-logs', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-kpi', factoryId] });
          break;
        case 'cnc:downtime-raised':
        case 'cnc:downtime-resolved':
          void queryClient.invalidateQueries({ queryKey: ['cnc-downtime', factoryId] });
          void queryClient.invalidateQueries({ queryKey: ['cnc-machines', factoryId] });
          break;
        default:
          break;
      }
    },
    [queryClient, factoryId],
  );

  return useWebSocket({
    namespace: 'cnc',
    factoryId: factoryId ?? '',
    token,
    onEvent,
  });
}
