import { useI18n } from '../i18n';

import './LanguageDropdown.css';

export function LanguageDropdown() {
    const { language, setLanguage, t } = useI18n();
    const isEnglish = language === 'en';
    const nextLabel = isEnglish ? '中' : 'EN';
    const ariaLabel = isEnglish
        ? t('app.switchToChinese')
        : t('app.switchToEnglish');

    const handleToggle = () => {
        setLanguage(isEnglish ? 'zh-TW' : 'en');
    };

    return (
        <button
            type='button'
            className='language-dropdown-trigger'
            onClick={handleToggle}
            aria-label={ariaLabel}
        >
            <span className='language-toggle-label'>{nextLabel}</span>
        </button>
    );
}
