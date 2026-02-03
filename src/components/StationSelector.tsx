import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Station } from '../types';

interface StationSelectorProps {
    stations: Station[];
    originId: string;
    setOriginId: (id: string) => void;
    destId: string;
    setDestId: (id: string) => void;
}

export function StationSelector({
    stations,
    originId,
    setOriginId,
    destId,
    setDestId,
}: StationSelectorProps) {
    const [originSearch, setOriginSearch] = useState('');
    const [destSearch, setDestSearch] = useState('');
    const [findingNearest, setFindingNearest] = useState(false);

    const handleSwap = () => {
        const temp = originId;
        setOriginId(destId);
        setDestId(temp);
    };

    const findNearestStation = () => {
        setFindingNearest(true);

        if (!navigator.geolocation) {
            alert('您的瀏覽器不支援定位功能');
            setFindingNearest(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Find nearest station
                let nearestStation = stations[0];
                let minDistance = Number.MAX_VALUE;

                stations.forEach((station) => {
                    if (station.lat && station.lon) {
                        const distance = Math.sqrt(
                            Math.pow(station.lat - latitude, 2) +
                                Math.pow(station.lon - longitude, 2)
                        );
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestStation = station;
                        }
                    }
                });

                setOriginId(nearestStation.id);
                setFindingNearest(false);
                alert(`已選擇最近車站：${nearestStation.name}`);
            },
            (error) => {
                console.error('定位錯誤:', error);
                alert('無法取得您的位置，請確認已允許瀏覽器使用定位功能');
                setFindingNearest(false);
            }
        );
    };

    const filteredOrigin = stations.filter(
        (s) =>
            s.name.includes(originSearch) ||
            s.nameEn.toLowerCase().includes(originSearch.toLowerCase())
    );

    const filteredDest = stations.filter(
        (s) =>
            s.name.includes(destSearch) || s.nameEn.toLowerCase().includes(destSearch.toLowerCase())
    );

    return (
        <div
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
            <div className="input-group">
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                    }}
                >
                    <label className="label-dim" style={{ marginBottom: 0 }}>
                        From (Origin)
                    </label>
                    <button
                        onClick={findNearestStation}
                        disabled={findingNearest}
                        style={{
                            padding: '0.3rem 0.8rem',
                            fontSize: '0.8rem',
                            color: 'var(--color-primary)',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '4px',
                            cursor: findingNearest ? 'wait' : 'pointer',
                            opacity: findingNearest ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                        }}
                    >
                        {findingNearest ? (
                            '定位中...'
                        ) : (
                            <>
                                <MapPin size={14} />
                                選擇最近
                            </>
                        )}
                    </button>
                </div>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search station..."
                        value={originSearch}
                        onChange={(e) => setOriginSearch(e.target.value)}
                    />
                    <select
                        value={originId}
                        onChange={(e) => {
                            setOriginId(e.target.value);
                            setOriginSearch('');
                        }}
                        style={{ marginTop: '0.5rem' }}
                    >
                        <option value="">Select Station</option>
                        {(originSearch ? filteredOrigin : stations).map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.nameEn})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.75rem 0' }}>
                <button
                    onClick={handleSwap}
                    style={{
                        padding: '10px',
                        color: 'var(--color-primary)',
                        fontSize: '1.4rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    title="Swap Stations"
                >
                    ⇅
                </button>
            </div>

            <div className="input-group">
                <label className="label-dim">To (Destination)</label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search station..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                    />
                    <select
                        value={destId}
                        onChange={(e) => {
                            setDestId(e.target.value);
                            setDestSearch('');
                        }}
                        style={{ marginTop: '0.5rem' }}
                    >
                        <option value="">Select Station</option>
                        {(destSearch ? filteredDest : stations).map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.nameEn})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
