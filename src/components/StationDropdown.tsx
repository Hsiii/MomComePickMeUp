import { useEffect, useRef } from 'react';

import type { Station } from '../types';

interface StationDropdownProps {
    stations: Station[];
    searchValue: string;
    setSearchValue: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedId: string;
    onSelect: (id: string) => void;
    placeholder: string;
    selectedStation?: Station;
    onCacheSelection?: (id: string) => void;
}

export function StationDropdown({
    stations,
    searchValue,
    setSearchValue,
    isOpen,
    setIsOpen,
    selectedId,
    onSelect,
    placeholder,
    selectedStation,
    onCacheSelection,
}: StationDropdownProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    const filteredStations = searchValue
        ? stations.filter(
              (s) =>
                  s.name.includes(searchValue) ||
                  s.nameEn.toLowerCase().includes(searchValue.toLowerCase())
          )
        : stations;

    const handleSelect = (id: string) => {
        onSelect(id);
        if (onCacheSelection) {
            onCacheSelection(id);
        }
        setSearchValue('');
        setIsOpen(false);
    };

    return (
        <div ref={ref} className='station-input-wrapper'>
            <input
                type='text'
                className='search-input station-input'
                placeholder={placeholder}
                value={searchValue || selectedStation?.name || ''}
                onChange={(e) => {
                    setSearchValue(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => {
                    setSearchValue('');
                    setIsOpen(true);
                }}
            />
            {isOpen && (
                <div className='station-dropdown'>
                    {filteredStations.map((s) => (
                        <div
                            key={s.id}
                            onClick={() => handleSelect(s.id)}
                            className={`station-dropdown-item ${s.id === selectedId ? 'selected' : ''}`}
                        >
                            <div className='station-dropdown-item-text'>
                                {s.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
