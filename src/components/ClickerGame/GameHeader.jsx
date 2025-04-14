import { formatNumber } from '@utils/calculators';
import { useState, useEffect } from 'react';

export default function GameHeader({ money, easyMode, onEasyModeToggle }) {
  const [environment, setEnvironment] = useState('production');
  
  useEffect(() => {
    // Prüfe, ob wir uns in der Beta-Version oder auf localhost befinden
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
    // Callback an die übergeordnete Komponente, um den Easy-Mode zu aktualisieren
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
    </>
  );
}