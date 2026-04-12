'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const TOKEN_KEY = 'ifactory_token';
const FACTORY_KEY = 'ifactory_fid';

interface AuthContextValue {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  login: async () => undefined,
  logout: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const router = useRouter();

  const login = useCallback(async (username: string, password: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? 'Login failed');
    }
    const json = (await res.json()) as { data: { accessToken: string } };
    const accessToken = json.data.accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(FACTORY_KEY);
    setToken(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
