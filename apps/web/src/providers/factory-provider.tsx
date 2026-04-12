'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'ifactory_fid';

const FactoryContext = createContext<{ factoryId: string | null }>({ factoryId: null });

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [factoryId, setFactoryId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  );

  useEffect(() => {
    if (factoryId) return; // already resolved from cache
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    fetch(`${BASE_URL}/factories`)
      .then((r) => r.json())
      .then((json: { data: { id: string }[] }) => {
        const id = json.data?.[0]?.id;
        if (id) {
          localStorage.setItem(STORAGE_KEY, id);
          setFactoryId(id);
        }
      })
      .catch(() => undefined); // fail silently; queries stay disabled until resolved
  }, [factoryId]);

  return (
    <FactoryContext.Provider value={{ factoryId }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  return useContext(FactoryContext);
}
