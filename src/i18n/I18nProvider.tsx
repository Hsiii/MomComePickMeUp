import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { I18nContext } from './context';
import {
    FALLBACK_LANGUAGE,
    LANGUAGE_OPTIONS,
    STORAGE_LANGUAGE_KEY,
    translations,
    type TranslationKey,
} from './translations';
import type { LanguageCode, TranslationParams } from './types';

function formatMessage(template: string, params?: TranslationParams): string {
    if (!params) return template;

    return template.replace(/\{(\w+)\}/g, (_, token: string) => {
        const value = params[token];
        return value === undefined ? `{${token}}` : String(value);
    });
}

function getStoredLanguage(): LanguageCode {
    const value = localStorage.getItem(STORAGE_LANGUAGE_KEY);
    const isSupported = LANGUAGE_OPTIONS.some(
        (option) => option.code === value
    );
    return isSupported ? (value as LanguageCode) : FALLBACK_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>(() =>
        getStoredLanguage()
    );

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (nextLanguage: LanguageCode) => {
        setLanguageState(nextLanguage);
        localStorage.setItem(STORAGE_LANGUAGE_KEY, nextLanguage);
    };

    const value = useMemo(() => {
        const t = (key: TranslationKey, params?: TranslationParams) => {
            const locale =
                language in translations ? language : FALLBACK_LANGUAGE;
            const localePack =
                translations[locale as keyof typeof translations] ||
                translations[FALLBACK_LANGUAGE];
            const template =
                localePack[key] || translations[FALLBACK_LANGUAGE][key];
            return formatMessage(template, params);
        };

        return { language, setLanguage, t };
    }, [language]);

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}
