'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TOKEN_KEY = 'ifactory_token';
const FACTORY_KEY = 'ifactory_fid';

interface JwtPayload {
  sub: string;
  username: string;
  fullName: string;
  role: string;
}

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function tokenToUser(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return { id: payload.sub, username: payload.username, fullName: payload.fullName, role: payload.role };
}

const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  login: async () => undefined,
  logout: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const router = useRouter();

  const user = useMemo(() => tokenToUser(token), [token]);

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
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
