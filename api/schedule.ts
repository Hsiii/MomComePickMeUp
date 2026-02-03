import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchTDX } from './_utils/tdx.js';
import type { TrainInfo as AppTrainInfo } from '../src/types.js';

interface TDXLiveDelay {
    TrainNo: string;
    DelayTime: number;
}

interface TDXStopTime {
    StationID: string;
    StationName: { Zh_tw: string };
    DepartureTime: string;
    ArrivalTime: string;
}

interface TDXFullTimetable {
    TrainInfo: {
        TrainNo: string;
        TrainTypeName: { Zh_tw: string };
        Direction: number;
    };
    StopTimes: TDXStopTime[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { origin, dest, date } = req.query;

    if (!origin || !dest) {
        return res.status(400).json({ error: 'Missing origin or dest parameters' });
    }

    const queryDate =
        (date as string) || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

    const isToday =
        queryDate === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

    try {
        // 1. Fetch full day schedule (OD endpoint is not available)
        // Use Today endpoint when querying current day for better performance
        const scheduleUrl = isToday
            ? `v3/Rail/TRA/DailyTrainTimetable/Today`
            : `v3/Rail/TRA/DailyTrainTimetable/TrainDate/${queryDate}`;
        const allTrains = await fetchTDX(scheduleUrl, { tier: 'basic' });

        // 2. Fetch Live Delays (All trains) using basic tier
        const delayData = await fetchTDX('v3/Rail/TRA/LiveTrainDelay', { tier: 'basic' });

        // Create a Map for O(1) delay lookup
        const delayMap = new Map<string, number>(); // TrainNo -> DelayMinutes
        if (delayData.LiveTrainDelays) {
            delayData.LiveTrainDelays.forEach((d: TDXLiveDelay) => {
                delayMap.set(d.TrainNo, d.DelayTime);
            });
        }

        // 3. Filter and Transform trains that stop at both stations in correct order
        const trains: AppTrainInfo[] = (allTrains.TrainTimetables || [])
            .map((t: TDXFullTimetable) => {
                const stops = t.StopTimes || [];
                const originStop = stops.find((s: TDXStopTime) => s.StationID === origin);
                const destStop = stops.find((s: TDXStopTime) => s.StationID === dest);

                // Skip if train doesn't stop at both stations
                if (!originStop || !destStop) return null;

                // Skip if dest comes before origin (wrong direction)
                const originIdx = stops.indexOf(originStop);
                const destIdx = stops.indexOf(destStop);
                if (destIdx <= originIdx) return null;

                const trainNo = t.TrainInfo.TrainNo;
                const delay = delayMap.get(trainNo);

                let status: 'on-time' | 'delayed' | 'cancelled' | 'unknown' = 'unknown';
                if (delay !== undefined) {
                    status = delay > 0 ? 'delayed' : 'on-time';
                }

                return {
                    trainNo,
                    trainType: t.TrainInfo.TrainTypeName.Zh_tw,
                    direction: t.TrainInfo.Direction,
                    originStation: originStop.StationName.Zh_tw,
                    destinationStation: destStop.StationName.Zh_tw,
                    departureTime: originStop.DepartureTime,
                    arrivalTime: destStop.ArrivalTime,
                    delay: delay || 0,
                    status,
                };
            })
            .filter((t: AppTrainInfo | null): t is AppTrainInfo => t !== null);

        // Sort by Departure Time (just in case)
        trains.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

        res.status(200).json({
            date: queryDate,
            origin: { id: origin, name: origin },
            destination: { id: dest, name: dest },
            trains,
        });
    } catch (error: unknown) {
        console.error('Error fetching schedule:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
}
