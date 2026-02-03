import { Share2, Copy } from 'lucide-react';
import type { TrainInfo } from '../types';

interface ShareCardProps {
    train: TrainInfo | null;
    originName: string;
    destName: string;
    template: string;
    setTemplate: (t: string) => void;
    resetTemplate: () => void;
}

export function ShareCard({
    train,
    originName,
    destName,
    template,
    setTemplate,
    resetTemplate,
}: ShareCardProps) {
    // Calculate adjusted arrival time (with delay)
    const getAdjustedTime = () => {
        if (!train) return '';
        if (!train.delay || train.delay === 0) return train.arrivalTime;

        const [hours, minutes] = train.arrivalTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + train.delay;
        const adjustedHours = Math.floor(totalMinutes / 60) % 24;
        const adjustedMinutes = totalMinutes % 60;
        return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
    };

    // Calculate message directly during render (derived state)
    const message = !train
        ? 'Please select a train first.'
        : template
              .replace('{train_type}', train.trainType)
              .replace('{train_no}', train.trainNo)
              .replace(
                  '{direction}',
                  train.direction === 0 ? 'Clockwise (Shun)' : 'Counter-clockwise (Ni)'
              )
              .replace('{origin}', originName)
              .replace('{dest}', destName)
              .replace('{time}', train.arrivalTime)
              .replace('{adjusted_time}', getAdjustedTime())
              .replace(
                  '{status}',
                  train.status === 'delayed' ? `Delayed ${train.delay}m` : 'On Time'
              );

    const handleShare = async () => {
        if (!train) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mom, Come Pick Me Up!',
                    text: message,
                });
            } catch (err) {
                console.log('Share canceled', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(message);
            alert('訊息已複製到剪貼簿！');
        }
    };

    const handleCopy = async () => {
        if (!train) return;

        try {
            await navigator.clipboard.writeText(message);
            alert('訊息已複製到剪貼簿！');
        } catch (err) {
            console.error('Copy failed', err);
            alert('複製失敗，請手動複製訊息。');
        }
    };

    if (!train) return null;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <label className="label-dim">Message Preview</label>

            <textarea
                className="glass-panel"
                style={{
                    width: '100%',
                    minHeight: '80px',
                    background: 'rgba(0,0,0,0.2)',
                    border: 'none',
                    color: 'var(--color-text)',
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                }}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Customize your message template..."
            />

            <div
                style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '1rem' }}
            >
                Result: <span style={{ color: '#fff' }}>{message}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleShare}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            fontSize: '0.875rem',
                            color: 'var(--color-text)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Share2 size={16} />
                        分享
                    </button>
                    <button
                        onClick={handleCopy}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            fontSize: '0.875rem',
                            color: 'var(--color-text)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <Copy size={16} />
                        複製
                    </button>
                </div>
                <button
                    onClick={resetTemplate}
                    style={{
                        padding: '0.5rem',
                        color: 'var(--color-text-dim)',
                        fontSize: '0.8rem',
                    }}
                    title="Reset to Default"
                >
                    重設範本
                </button>
            </div>
        </div>
    );
}
