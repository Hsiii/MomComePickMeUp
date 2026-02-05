import type { VercelRequest, VercelResponse } from '@vercel/node';

import { fetchTDX } from './_utils/tdx.js';

// Simple in-memory cache for stations data
let stationsCache: { data: TDXStation[]; expires: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (stations rarely change)

interface TDXStation {
    StationID: string;
    StationName: {
        Zh_tw: string;
        En: string;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const now = Date.now();
        let data;

        // Check cache first
        if (stationsCache && stationsCache.expires > now) {
            data = stationsCache.data;
            console.log('Using cached stations data');
        } else {
            // Fetch Simplified Station List from TRA using basic tier
            // Filter by fields to reduce size: StationID, StationName
            data = await fetchTDX('v3/Rail/TRA/Station', {
                searchParams: {
                    $select: 'StationID,StationName,StationPosition',
                    $top: '999', // Get all stations
                },
                tier: 'basic',
            });
            stationsCache = { data, expires: now + CACHE_TTL };
        }

        // The response is a direct array, not wrapped in a Stations property
        // Transform to our Station type
        const stations = (Array.isArray(data) ? data : data.Stations || []).map(
            (
                s: TDXStation & {
                    StationPosition?: {
                        PositionLat?: number;
                        PositionLon?: number;
                    };
                }
            ) => ({
                id: s.StationID,
                name: s.StationName.Zh_tw,
                nameEn: s.StationName.En,
                lat: s.StationPosition?.PositionLat,
                lon: s.StationPosition?.PositionLon,
            })
        );

        // Cache stations for 24 hours on CDN (stations rarely change)
        res.setHeader(
            'Cache-Control',
            's-maxage=86400, stale-while-revalidate=604800'
        );
        res.status(200).json(stations);
    } catch (error: unknown) {
        console.error('Error fetching stations:', error);
        // Return generic error message to avoid information disclosure
        const message =
            process.env.NODE_ENV === 'development' && error instanceof Error
                ? error.message
                : 'Failed to fetch stations. Please try again.';
        res.status(500).json({ error: message });
    }
}
