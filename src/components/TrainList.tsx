import {
    startTransition,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import { api } from '../api/client';
import { useI18n } from '../i18n';
import type { TrainInfo } from '../types';
import { TrainListSkeleton } from './TrainListSkeleton';

import './TrainList.css';

/**
 * Parse train type to extract simple term
 * Examples:
 * - "自強(商務專開列車)" → "自強"
 * - "區間" → "區間"
 * - "莒光(跨線列車)" → "莒光"
 */
function parseTrainType(trainType: string): string {
    // Remove content in parentheses and any suffix like "號"
    return trainType.split('(')[0].replace(/號$/, '');
}

/** Add minutes to a HH:mm time string */
function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/** Calculate trip duration in minutes between two HH:mm strings */
function getTripMinutes(departure: string, arrival: string): number {
    const [dh, dm] = departure.split(':').map(Number);
    const [ah, am] = arrival.split(':').map(Number);
    let diff = ah * 60 + am - (dh * 60 + dm);
    if (diff < 0) diff += 24 * 60; // crosses midnight
    return diff;
}

function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h${m}m`;
}

interface TrainListProps {
    originId: string;
    destId: string;
    onSelect: (train: TrainInfo) => void;
    selectedTrainNo: string | null;
}

export function TrainList({
    originId,
    destId,
    onSelect,
    selectedTrainNo,
}: TrainListProps) {
    const { t } = useI18n();
    const [trains, setTrains] = useState<TrainInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);
    const lastFetchTimeRef = useRef<number | null>(null);
    const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined
    );
    const lastFetchParamsRef = useRef<string>('');
    const isFirstMountRef = useRef(true);

    const fetchSchedule = useCallback(() => {
        if (!originId || !destId) return;

        // Prevent duplicate requests
        const currentParams = `${originId}-${destId}`;
        if (
            lastFetchParamsRef.current === currentParams &&
            lastFetchTimeRef.current &&
            Date.now() - lastFetchTimeRef.current < 3000
        ) {
            console.log('Skipping duplicate request within 3 seconds');
            return;
        }

        lastFetchParamsRef.current = currentParams;
        setLoading(true);
        setError(null);

        api.getSchedule(originId, destId)
            .then((res) => {
                const now = new Date();
                const currentTimeStr = now.toLocaleTimeString('en-CA', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Taipei',
                });

                const nextTrainIndex = res.trains.findIndex(
                    (t) => t.departureTime >= currentTimeStr
                );

                let displayTrains: TrainInfo[] = [];
                let recommendedTrain: TrainInfo | null = null;

                if (nextTrainIndex === -1) {
                    displayTrains = res.trains.slice(-3);
                    recommendedTrain = displayTrains[displayTrains.length - 1];
                } else {
                    const start = Math.max(0, nextTrainIndex - 1);
                    const end = start + 3;
                    displayTrains = res.trains.slice(start, end);
                    recommendedTrain =
                        displayTrains.find(
                            (t) => t.departureTime >= currentTimeStr
                        ) || displayTrains[0];
                }

                setTrains(displayTrains);
                setLoading(false);
                lastFetchTimeRef.current = Date.now();
                setHasData(true);

                if (recommendedTrain) {
                    onSelect(recommendedTrain);
                }
            })
            .catch((err) => {
                console.error(err);
                setError(t('error.failedToLoadSchedule'));
                setLoading(false);
            });
    }, [originId, destId, onSelect, t]);

    useEffect(() => {
        // Clear any pending debounced fetch
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Debounce initial fetch (500ms) to allow rapid selection changes
        // Skip debounce on first mount to avoid initial delay
        const delay = isFirstMountRef.current ? 0 : 500;
        isFirstMountRef.current = false;

        fetchTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
                fetchSchedule();
            });
        }, delay);

        // Poll every minute
        const interval = setInterval(() => {
            startTransition(() => {
                fetchSchedule();
            });
        }, 60000);

        return () => {
            clearInterval(interval);
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [fetchSchedule]);

    if (!originId || !destId) return null;
    // Show loading only if we don't have any data yet
    const shouldShowLoading = loading && !hasData;

    if (error)
        return (
            <div className='card-panel train-list-error'>
                <div className='train-list-error-message'>{error}</div>
                <button
                    onClick={fetchSchedule}
                    className='btn-primary train-list-error-button'
                >
                    {t('common.retry')}
                </button>
            </div>
        );

    // Show skeleton if loading and no data yet
    if (shouldShowLoading && trains.length === 0) {
        return <TrainListSkeleton />;
    }

    if (!shouldShowLoading && trains.length === 0)
        return (
            <div className='train-list-empty'>
                {t('train.noTrainsAvailable')}
            </div>
        );

    return (
        <div>
            <span className='label-dim'>{t('app.selectTrain')}</span>

            <div className='train-list-container'>
                {(shouldShowLoading ? [1, 2, 3] : trains).map((train, idx) => {
                    if (shouldShowLoading) {
                        // Render skeleton cards
                        return (
                            <div
                                key={idx}
                                className='card-panel train-card skeleton-card'
                            >
                                <div className='train-card-left'>
                                    <div className='train-card-time-row'>
                                        <span className='skeleton skeleton-time'></span>
                                        <span className='train-card-arrow skeleton-arrow'>
                                            ➔
                                        </span>
                                        <span className='skeleton skeleton-time'></span>
                                    </div>
                                    <div className='skeleton skeleton-details'></div>
                                </div>
                            </div>
                        );
                    }

                    // Render actual train data
                    const trainData = train as TrainInfo;
                    const isSelected = trainData.trainNo === selectedTrainNo;
                    const isDelayed = (trainData.delay ?? 0) > 0;
                    const tripMin = getTripMinutes(
                        trainData.departureTime,
                        trainData.arrivalTime
                    );

                    return (
                        <div
                            key={trainData.trainNo}
                            className={`card-panel clickable-item train-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect(trainData)}
                        >
                            <div className='train-card-times'>
                                <span
                                    className={`train-card-time-cell ${isDelayed ? 'delayed' : ''}`}
                                >
                                    {isDelayed && (
                                        <span className='train-card-delayed-time'>
                                            {addMinutes(
                                                trainData.departureTime,
                                                trainData.delay!
                                            )}
                                        </span>
                                    )}
                                    <span
                                        className={
                                            isDelayed
                                                ? 'train-card-original-time'
                                                : 'train-card-departure-time'
                                        }
                                    >
                                        {trainData.departureTime}
                                    </span>
                                </span>
                                <div className='train-card-separator'>
                                    <span className='train-card-line' />
                                    <span className='train-card-trip-time'>
                                        {formatDuration(tripMin)}
                                    </span>
                                    <span className='train-card-line' />
                                </div>
                                <span
                                    className={`train-card-time-cell ${isDelayed ? 'delayed' : ''}`}
                                >
                                    {isDelayed && (
                                        <span className='train-card-delayed-time'>
                                            {addMinutes(
                                                trainData.arrivalTime,
                                                trainData.delay!
                                            )}
                                        </span>
                                    )}
                                    <span
                                        className={
                                            isDelayed
                                                ? 'train-card-original-time'
                                                : 'train-card-arrival-time'
                                        }
                                    >
                                        {trainData.arrivalTime}
                                    </span>
                                </span>
                            </div>
                            <div className='train-card-info'>
                                <span
                                    className={`train-card-dot ${isDelayed ? 'delayed' : 'on-time'}`}
                                />
                                <span className='train-card-type'>
                                    {parseTrainType(trainData.trainType)}
                                </span>
                                <span className='train-card-number'>
                                    {trainData.trainNo}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
