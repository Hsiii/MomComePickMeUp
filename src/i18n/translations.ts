import type { LanguageOption } from './types';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'en', label: 'English' },
];

export const translations = {
    'zh-TW': {
        'app.title': 'OnTrack',
        'app.selectRoute': '選擇路線',
        'app.selectTrain': '選擇班次',
        'app.searchStation': '搜尋車站',
        'app.selectStationsPrompt': '選擇出發及到達車站以查詢時刻表',
        'app.settingsAriaLabel': '設定',
        'app.switchToEnglish': '切換成英文',
        'app.switchToChinese': '切換成中文',

        'train.onTime': 'On Time',
        'train.next': 'Next',
        'train.delayMinutes': '+{minutes} min',
        'train.noTrainsAvailable': '查無可搭乘班次',

        'error.failedToLoadSchedule': '無法取得時刻表',
        'common.retry': '重試',

        'share.arrivalMessage': '{time}到{station}',
        'share.noTrainMessage': '好像沒車搭了',
        'share.lineIconAlt': 'Line',

        'settings.autoDetectOrigin': '自動偵測起點站',
        'settings.defaultDestination': '設定預設目的地',
        'settings.selectStation': '選擇車站',

        'iosInstall.title': '加到主畫面',
        'iosInstall.subtitle': '將 {appName} 加入主畫面以享受最佳使用體驗',
        'iosInstall.step1': '點擊底部的「分享」按鈕',
        'iosInstall.step2': '選擇「加入主畫面」',
        'iosInstall.dismiss': '知道了',
    },
    'en': {
        'app.title': 'OnTrack',
        'app.selectRoute': 'Select Route',
        'app.selectTrain': 'Select Train',
        'app.searchStation': 'Search station',
        'app.selectStationsPrompt':
            'Select origin and destination stations to view schedules',
        'app.settingsAriaLabel': 'Settings',
        'app.switchToEnglish': 'Switch to English',
        'app.switchToChinese': 'Switch to Chinese',

        'train.onTime': 'On Time',
        'train.next': 'Next',
        'train.delayMinutes': '+{minutes} min',
        'train.noTrainsAvailable': 'No trains available',

        'error.failedToLoadSchedule': 'Failed to load schedule',
        'common.retry': 'Retry',

        'share.arrivalMessage': 'Arrive at {station} by {time}',
        'share.noTrainMessage': 'No more trains available',
        'share.lineIconAlt': 'Line',

        'settings.autoDetectOrigin': 'Auto-detect origin',
        'settings.defaultDestination': 'Default destination',
        'settings.selectStation': 'Select station',

        'iosInstall.title': 'Add to Home Screen',
        'iosInstall.subtitle':
            'Add {appName} to your Home Screen for the best experience',
        'iosInstall.step1': 'Tap the Share button at the bottom',
        'iosInstall.step2': 'Choose Add to Home Screen',
        'iosInstall.dismiss': 'Got it',
    },
} as const;

export type TranslationKey = keyof (typeof translations)['zh-TW'];

export const FALLBACK_LANGUAGE: keyof typeof translations = 'zh-TW';
export const STORAGE_LANGUAGE_KEY = 'ontrack_language';
