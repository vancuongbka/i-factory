'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  namespace: string;
  factoryId: string;
  token: string;
  onEvent?: (event: string, data: unknown) => void;
}

export function useWebSocket({ namespace, factoryId, token, onEvent }: UseWebSocketOptions): MutableRefObject<Socket | null> {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

    socketRef.current = io(`${wsUrl}/${namespace}`, {
      auth: { token, factoryId },
    });

    if (onEvent) {
      socketRef.current.onAny(onEvent);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace, factoryId, token, onEvent]);

  return socketRef;
}
