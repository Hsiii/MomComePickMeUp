/**
 * All user-facing strings in the app.
 * Centralized for easier management and future localization.
 */
export const STRINGS = {
    // App Header
    APP_TITLE: 'OnTrack',

    // Labels
    SELECT_ROUTE: '選擇路線',
    SELECT_TRAIN: '選擇班次',
    SEARCH_STATION: '搜尋車站',

    // Train Status
    ON_TIME: 'On Time',
    NEXT_TRAIN: 'Next',
    DELAY_MINUTES: (minutes: number) => `+${minutes} min`,

    // Error Messages
    FAILED_TO_LOAD_SCHEDULE: '無法取得時刻表',
    NO_TRAINS_AVAILABLE: '查無可搭乘班次',

    // Placeholder Messages
    SELECT_STATIONS_PROMPT: '選擇出發及到達車站以查詢時刻表',

    // Buttons
    RETRY: '重試',

    // Share Card
    ARRIVAL_MESSAGE: (time: string, station: string) => `${time}到${station}`,
    NO_TRAIN_MESSAGE: '好像沒車搭了',

    // Alt Text
    LINE_ICON_ALT: 'Line',

    // Settings
    SETTINGS_AUTO_DETECT_ORIGIN: '自動偵測起點站',
    SETTINGS_ENABLE_LOCATION: '啟用定位',
    SETTINGS_DEFAULT_DESTINATION: '設定預設目的地',
    SETTINGS_SELECT_STATION: '選擇車站',

    // iOS Install Prompt
    IOS_INSTALL_TITLE: '加到主畫面',
    IOS_INSTALL_SUBTITLE: (appName: string) =>
        `將 ${appName} 加入主畫面以享受最佳使用體驗`,
    IOS_INSTALL_STEP_1: '點擊底部的「分享」按鈕',
    IOS_INSTALL_STEP_2: '選擇「加入主畫面」',
    IOS_INSTALL_DISMISS: '知道了',
    IOS_INSTALL_CLOSE: '關閉',
} as const;
