import type { Station, ScheduleResponse } from '../types';

// In-flight request cache to prevent duplicate simultaneous requests
const inflightRequests = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string, retryCount = 0): Promise<T> {
    // Check if there's already an in-flight request for this URL
    const cacheKey = `${url}-${retryCount}`;
    if (inflightRequests.has(cacheKey)) {
        console.log('Reusing in-flight request for:', url);
        return inflightRequests.get(cacheKey) as Promise<T>;
    }

    // Create new request and cache it
    const requestPromise = (async () => {
        try {
            const response = await fetch(url);

            // Handle 429 Too Many Requests with exponential backoff
            if (response.status === 429 && retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                console.warn(
                    `Rate limited (429). Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                // Clear cache before retry
                inflightRequests.delete(cacheKey);
                return fetchJson<T>(url, retryCount + 1);
            }

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error ${response.status}: ${errorBody}`);
            }

            return response.json();
        } finally {
            // Clean up cache after request completes (success or failure)
            inflightRequests.delete(cacheKey);
        }
    })();

    inflightRequests.set(cacheKey, requestPromise);
    return requestPromise;
}

export const api = {
    getStations: () => fetchJson<Station[]>('/api/stations'),

    getSchedule: (origin: string, dest: string, date?: string) => {
        const params = new URLSearchParams({ origin, dest });
        if (date) params.append('date', date);
        return fetchJson<ScheduleResponse>(`/api/schedule?${params.toString()}`);
    },
};
