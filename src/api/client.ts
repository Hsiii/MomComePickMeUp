import type { Station, ScheduleResponse } from '../types';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }
  return response.json();
}

export const api = {
  getStations: () => fetchJson<Station[]>('/api/stations'),

  getSchedule: (origin: string, dest: string, date?: string) => {
    const params = new URLSearchParams({ origin, dest });
    if (date) params.append('date', date);
    return fetchJson<ScheduleResponse>(`/api/schedule?${params.toString()}`);
  },
};
