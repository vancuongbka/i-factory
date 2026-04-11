'use client';

import { createContext, useContext, useState } from 'react';

interface FactoryContextValue {
  factoryId: string | null;
  setFactoryId: (id: string) => void;
}

const FactoryContext = createContext<FactoryContextValue>({
  factoryId: null,
  setFactoryId: () => undefined,
});

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [factoryId, setFactoryId] = useState<string | null>(null);
  return (
    <FactoryContext.Provider value={{ factoryId, setFactoryId }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  return useContext(FactoryContext);
}
