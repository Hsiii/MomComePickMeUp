import { useState } from 'react';
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

  const handleSwap = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  const filteredOrigin = stations.filter(
    (s) =>
      s.name.includes(originSearch) || s.nameEn.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDest = stations.filter(
    (s) => s.name.includes(destSearch) || s.nameEn.toLowerCase().includes(destSearch.toLowerCase())
  );

  return (
    <div
      className="glass-panel"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div className="input-group">
        <label className="label-dim">From (Origin)</label>
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
            {(originSearch ? filteredOrigin : stations).slice(0, 50).map((s) => (
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
            {(destSearch ? filteredDest : stations).slice(0, 50).map((s) => (
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
