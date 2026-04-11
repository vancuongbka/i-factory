/**
 * Typed API client — mọi request đi qua đây, KHÔNG fetch URL trực tiếp trong components.
 * Sử dụng types từ @i-factory/api-types để đảm bảo type safety.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: response.statusText }))) as { message?: string };
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  const json = (await response.json()) as { data: T };
  return json.data;
}

// TODO: Thêm typed methods cho từng domain khi implement
export const apiClient = {
  factories: {
    list: (token?: string) => request<unknown[]>('/factories', { token }),
  },
  production: {
    list: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/production`, { token }),
  },
  workOrders: {
    list: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/work-orders`, { token }),
  },
  inventory: {
    materials: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/inventory/materials`, { token }),
  },
  qc: {
    inspections: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/qc/inspections`, { token }),
  },
  reports: {
    request: (body: unknown, token?: string) =>
      request<unknown>('/reports', { method: 'POST', body: JSON.stringify(body), token }),
    status: (jobId: string, token?: string) =>
      request<unknown>(`/reports/${jobId}/status`, { token }),
  },
  notifications: {
    list: (factoryId: string, token?: string) =>
      request<unknown[]>(`/factories/${factoryId}/notifications`, { token }),
  },
};
