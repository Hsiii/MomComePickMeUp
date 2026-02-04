import { useEffect, useState } from 'react';
import { Plus, Share } from 'lucide-react';

import { STRINGS } from '../constants';

import './IOSInstallPrompt.css';

const DISMISSED_KEY = 'ios-install-prompt-dismissed';

// Extend Navigator interface for iOS-specific property
declare global {
    interface Navigator {
        standalone?: boolean;
    }
}

function isIOSDevice(): boolean {
    return (
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream
    );
}

function isStandaloneMode(): boolean {
    return window.navigator.standalone === true;
}

function wasPromptDismissed(): boolean {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
}

export function IOSInstallPrompt() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show prompt only on iOS, not in standalone mode, and not previously dismissed
        if (isIOSDevice() && !isStandaloneMode() && !wasPromptDismissed()) {
            // Delay showing the prompt slightly so it doesn't appear immediately
            const timer = setTimeout(() => setVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem(DISMISSED_KEY, 'true');
    };

    if (!visible) return null;

    return (
        <div className='ios-install-overlay' onClick={handleDismiss}>
            <div
                className='ios-install-prompt'
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className='ios-install-title'>
                    {STRINGS.IOS_INSTALL_TITLE}
                </h3>
                <p className='ios-install-subtitle'>
                    {STRINGS.IOS_INSTALL_SUBTITLE(STRINGS.APP_TITLE)}
                </p>

                <div className='ios-install-steps'>
                    <div className='ios-install-step'>
                        <div className='ios-install-step-icon'>
                            <Share size={22} />
                        </div>
                        <div className='ios-install-step-text'>
                            <span className='ios-install-step-number'>1</span>
                            {STRINGS.IOS_INSTALL_STEP_1}
                        </div>
                    </div>

                    <div className='ios-install-step'>
                        <div className='ios-install-step-icon'>
                            <Plus size={22} />
                        </div>
                        <div className='ios-install-step-text'>
                            <span className='ios-install-step-number'>2</span>
                            {STRINGS.IOS_INSTALL_STEP_2}
                        </div>
                    </div>
                </div>

                <button className='ios-install-dismiss' onClick={handleDismiss}>
                    {STRINGS.IOS_INSTALL_DISMISS}
                </button>
            </div>

            {/* Arrow pointing to Safari's share button */}
            <div className='ios-install-arrow'>
                <svg
                    width='40'
                    height='60'
                    viewBox='0 0 40 60'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        d='M20 0 L20 45 M5 30 L20 45 L35 30'
                        stroke='currentColor'
                        strokeWidth='3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
            </div>
        </div>
    );
}
