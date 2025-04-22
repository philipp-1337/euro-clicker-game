import { formatNumber } from '@utils/calculators';
import { useState, useEffect } from 'react';

export default function GameHeader({ money, easyMode, onEasyModeToggle, playTime, onSaveGame, totalMoneyPerSecond }) {
  const [environment, setEnvironment] = useState('production');

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('beta')) {
      setEnvironment('beta');
    } else if (hostname.includes('alpha')) {
      setEnvironment('alpha');
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setEnvironment('localhost');
    } else {
      setEnvironment('production');
    }
  }, []);

  const toggleEasyMode = () => {
    if (onEasyModeToggle) {
      onEasyModeToggle(!easyMode);
    }
  };

  const renderEnvironmentLabel = () => {
    if (environment === 'production') return null;

    const labelText = environment === 'beta' ? 'beta' : 'localhost';
    const displayText = easyMode ? `${labelText} (easy)` : labelText;

    return (
      <span 
        className={`env-label ${environment}`} 
        onClick={toggleEasyMode}
        title="Toggle Easy Mode"
      >
        {displayText}
      </span>
    );
  };

  const formatPlayTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 || hours > 0 ? `${minutes}m` : null,
      `${seconds}s`
    ]
    .filter(Boolean)
    .join(' ');
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const triggerSaveFeedback = (message = 'Game saved') => {
    setSaveMessage(message);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('');
    }, 1500);
  };

  useEffect(() => {
    const handleAutoSave = () => {
      triggerSaveFeedback('Auto-saved'); // 🆕
    };
    window.addEventListener('game:autosaved', handleAutoSave);
    return () => window.removeEventListener('game:autosaved', handleAutoSave);
  }, []);

  return (
    <>
      {isSaving && (
        <div className="save-feedback-banner">
          {saveMessage}
        </div>
      )}
      <div className="game-header-container">
        <h1 className="game-title">
          Euro Clicker Game
          {renderEnvironmentLabel()}
        </h1>
      </div>
      <div className="money-display">
        {formatNumber(money)} €
        {/* Einkommen pro Sekunde anzeigen, wenn > 0 */}
        {totalMoneyPerSecond > 0 && (
          <span class="per-second" style={{ fontSize: '1rem', marginLeft: 12, color: '#2ecc71' }}>
            +{formatNumber(totalMoneyPerSecond)} €/s
          </span>
        )}
      </div>
      <div className="playtime-display">
        ⏱ {formatPlayTime(playTime)}

        <button
          className="header-button"
          onClick={() => {
            onSaveGame();
            triggerSaveFeedback('Saved');
          }}
          title="Save"
        >
          {isSaving ? '✅' : '💾'}
        </button>

        <button
          className="header-button"
          onClick={() => {
            const confirmReset = window.confirm('Are you sure you want to reset your game progress?');
            if (confirmReset) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          title="Reset Game"
        >
          🗑️
        </button>
      </div>
    </>
  );
}