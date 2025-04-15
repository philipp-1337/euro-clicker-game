import { formatNumber } from '@utils/calculators';
import { useState, useEffect } from 'react';

export default function GameHeader({ money, easyMode, onEasyModeToggle, playTime }) {
  const [environment, setEnvironment] = useState('production');

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('beta')) {
      setEnvironment('beta');
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

  return (
    <>
      <div className="game-header-container">
        <h1 className="game-title">
          Euro Clicker Game
          {renderEnvironmentLabel()}
        </h1>
      </div>
      <div className="money-display">
        {formatNumber(money)} €
      </div>
      <div className="playtime-display">
        ⏱ {formatPlayTime(playTime)} gespielt
      </div>
    </>
  );
}