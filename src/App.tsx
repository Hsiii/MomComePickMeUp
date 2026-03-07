import { useEffect, useMemo, useState } from 'react';

import './App.css';

import { TrainFront } from 'lucide-react';

import { api } from './api/client';
import {
    IOSInstallPrompt,
    LanguageDropdown,
    ShareCard,
    StationSelector,
    StationSelectorSkeleton,
    TrainList,
} from './components';
import { usePersistence } from './hooks/usePersistence';
import { useI18n } from './i18n';
import type { Station, TrainInfo } from './types';

function formatEnglishStationName(name?: string) {
    return name?.replace(/_/g, ' ');
}

function App() {
    const { t, language } = useI18n();
    const {
        originId,
        setOriginId,
        destId,
        setDestId,
        defaultDestId,
        setDefaultDestId,
        autoDetectOrigin,
        setAutoDetectOrigin,
    } = usePersistence();

    const [stations, setStations] = useState<Station[]>([]);
    const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null);
    const [stationsLoading, setStationsLoading] = useState(true);

    // Fetch stations at App level to provide names to ShareCard
    useEffect(() => {
        api.getStations()
            .then(setStations)
            .catch(console.error)
            .finally(() => setStationsLoading(false));
    }, []);

    const stationMap = useMemo(
        () =>
            new Map(
                stations.map((station): [string, Station] => [
                    station.id,
                    station,
                ])
            ),
        [stations]
    );

    const originStation = stationMap.get(originId);
    const destStation = stationMap.get(destId);

    const isEn = language === 'en';
    const originName =
        (isEn
            ? formatEnglishStationName(originStation?.nameEn)
            : originStation?.name) || originId;
    const destName =
        (isEn
            ? formatEnglishStationName(destStation?.nameEn)
            : destStation?.name) || destId;

    return (
        <>
            <IOSInstallPrompt />
            <header className='app-header'>
                <div className='app-header-left'>
                    <TrainFront className='app-header-icon' strokeWidth={2} />
                    <h1 className='app-header-title'>{t('app.title')}</h1>
                </div>
                <div className='app-header-actions'>
                    <LanguageDropdown />
                </div>
            </header>
            <div className='app-container'>
                <main className='app-main'>
                    <div>
                        <span className='label-dim'>
                            {t('app.selectRoute')}
                        </span>
                        {stationsLoading ? (
                            <StationSelectorSkeleton />
                        ) : (
                            <StationSelector
                                stations={stations}
                                originId={originId}
                                setOriginId={setOriginId}
                                destId={destId}
                                setDestId={setDestId}
                                autoDetectOrigin={autoDetectOrigin}
                                setAutoDetectOrigin={setAutoDetectOrigin}
                                defaultDestId={defaultDestId}
                                setDefaultDestId={setDefaultDestId}
                            />
                        )}
                    </div>

                    {!stationsLoading && originId && destId && (
                        <TrainList
                            originId={originId}
                            destId={destId}
                            onSelect={setSelectedTrain}
                            selectedTrainNo={selectedTrain?.trainNo || null}
                        />
                    )}

                    <ShareCard
                        train={selectedTrain}
                        originName={originName}
                        destName={destName}
                    />
                </main>
            </div>
        </>
    );
}

export default App;
