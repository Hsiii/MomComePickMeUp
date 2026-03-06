import { useState } from 'react';
import { MapPin } from 'lucide-react';

import { useI18n } from '../i18n';
import type { Station } from '../types';
import { StationDropdown } from './StationDropdown';

import './Settings.css';

interface SettingsProps {
    stations: Station[];
    autoDetectOrigin: boolean;
    setAutoDetectOrigin: (value: boolean) => void;
    defaultDestId: string;
    setDefaultDestId: (id: string) => void;
    setDestId: (id: string) => void;
}

export function Settings({
    stations,
    autoDetectOrigin,
    setAutoDetectOrigin,
    defaultDestId,
    setDefaultDestId,
    setDestId,
}: SettingsProps) {
    const { t } = useI18n();
    const [destSearch, setDestSearch] = useState('');
    const [destDropdownOpen, setDestDropdownOpen] = useState(false);

    const selectedStation = stations.find((s) => s.id === defaultDestId);

    const handleDefaultDestChange = (id: string) => {
        setDefaultDestId(id);
        setDestId(id);
    };

    return (
        <div className='settings-section'>
            <div className='settings-item'>
                <span className='settings-item-label'>
                    {t('settings.autoDetectOrigin')}
                </span>
                <div className='settings-switch-row'>
                    <MapPin size={20} className='settings-switch-icon' />
                    <input
                        type='checkbox'
                        className='settings-switch'
                        checked={autoDetectOrigin}
                        onChange={(e) => setAutoDetectOrigin(e.target.checked)}
                    />
                </div>
            </div>

            {/* Spacer to match the arrow width in StationSelector */}
            <div className='settings-spacer' />

            <div className='settings-item'>
                <span className='settings-item-label'>
                    {t('settings.defaultDestination')}
                </span>
                <StationDropdown
                    stations={stations}
                    searchValue={destSearch}
                    setSearchValue={setDestSearch}
                    isOpen={destDropdownOpen}
                    setIsOpen={setDestDropdownOpen}
                    selectedId={defaultDestId}
                    onSelect={handleDefaultDestChange}
                    placeholder={t('settings.selectStation')}
                    selectedStation={selectedStation}
                />
            </div>
        </div>
    );
}
