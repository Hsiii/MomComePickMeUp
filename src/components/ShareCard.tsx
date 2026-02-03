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
        .replace('{status}', train.status === 'delayed' ? `Delayed ${train.delay}m` : 'On Time');

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
      alert('Message copied to clipboard!');
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

      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', marginBottom: '1rem' }}>
        Result: <span style={{ color: '#fff' }}>{message}</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleShare}
          className="btn-primary"
          style={{ flex: 1, fontSize: '1.2rem' }}
        >
          Pick Me Up! 🚙
        </button>
        <button
          onClick={resetTemplate}
          style={{ padding: '0 10px', color: 'var(--color-text-dim)', fontSize: '0.8rem' }}
          title="Reset to Default"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
