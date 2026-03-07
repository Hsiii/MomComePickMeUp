import { useEffect, useState } from 'react';
import twFlag from 'flag-icons/flags/4x3/tw.svg';
import usFlag from 'flag-icons/flags/4x3/us.svg';
import { Globe } from 'lucide-react';

import { useI18n } from '../i18n';

import './LanguageDropdown.css';

export function LanguageDropdown() {
    const { language, setLanguage, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleLanguageSelect = (nextLanguage: 'zh-TW' | 'en') => {
        setLanguage(nextLanguage);
        setIsOpen(false);
    };

    return (
        <>
            <button
                type='button'
                className='language-dropdown-trigger'
                onClick={() => setIsOpen(true)}
                aria-label={t('language.openDialog')}
                title={t('language.openDialog')}
            >
                <Globe aria-hidden='true' />
            </button>

            {isOpen && (
                <div
                    className='language-dialog-backdrop'
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className='language-dialog card-panel'
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='language-dialog-title'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2
                            id='language-dialog-title'
                            className='language-dialog-title'
                        >
                            {t('language.selectTitle')}
                        </h2>

                        <div className='language-dialog-options'>
                            <button
                                type='button'
                                className={`language-option ${language === 'zh-TW' ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect('zh-TW')}
                            >
                                <span className='language-option-flag-shell'>
                                    <img
                                        className='language-option-flag'
                                        src={twFlag}
                                        alt=''
                                        aria-hidden='true'
                                    />
                                </span>
                                <span className='language-option-text'>
                                    {t('language.zhTW')}
                                </span>
                            </button>

                            <button
                                type='button'
                                className={`language-option ${language === 'en' ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect('en')}
                            >
                                <span className='language-option-flag-shell'>
                                    <img
                                        className='language-option-flag'
                                        src={usFlag}
                                        alt=''
                                        aria-hidden='true'
                                    />
                                </span>
                                <span className='language-option-text'>
                                    {t('language.en')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
