const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
  return json as T;
}

export const api = {
  health: () => apiRequest<{ status: string }>('/api/health'),

  getEntries: (userId: string) =>
    apiRequest<any[]>(`/api/entries/${userId}`),

  getEntry: (userId: string, entryId: string) =>
    apiRequest<any>(`/api/entries/${userId}/${entryId}`),

  createEntry: (userId: string, data: any) =>
    apiRequest<any>(`/api/entries/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEntry: (userId: string, entryId: string, data: any) =>
    apiRequest<any>(`/api/entries/${userId}/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEntry: (userId: string, entryId: string) =>
    apiRequest<any>(`/api/entries/${userId}/${entryId}`, {
      method: 'DELETE',
    }),

  deleteAllEntries: (userId: string) =>
    apiRequest<any>(`/api/entries/${userId}`, {
      method: 'DELETE',
    }),

  createDeviceUser: (deviceId: string) =>
    apiRequest<{ userId: string }>('/api/auth/device', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    }),
};
