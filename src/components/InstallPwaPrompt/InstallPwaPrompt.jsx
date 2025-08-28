import React from 'react';
import { usePwaPrompt } from '../../hooks/usePwaPrompt';
// import { Share, SquarePlus } from 'lucide-react';

const InstallPwaPrompt = () => {
  const { 
    showInstallPrompt, 
    // isIos, 
    handleInstallClick, 
    handleDismissClick 
  } = usePwaPrompt();
  // const showInstallPrompt = true; // TEMP: Prompt immer anzeigen

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="pwa-prompt">
      <div className="pwa-prompt-content">
        {/* {isIos ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>
              Installiere die App auf deinem Gerät:<br />
              <span className="pwa-prompt-icon-label">Teile-Icon</span> &rarr; <span className="pwa-prompt-icon-label">"Zum Home-Bildschirm"</span>
            </p>
            <div className="pwa-prompt-icons">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Share size={40} color="#5f9ea0" />
                <span className="pwa-prompt-icon-label">Teilen</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SquarePlus size={40} color="#5f9ea0" />
                <span className="pwa-prompt-icon-label">Home</span>
              </div>
            </div>
          </div>
        ) : ( */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>
              Gefällt dir das Spiel?<br />Installiere es für die beste Erfahrung!
            </p>
            <button className="pwa-prompt-btn-primary" onClick={handleInstallClick}>
              App installieren
            </button>
          </div>
        {/* )} */}
        <button className="pwa-prompt-btn-secondary" onClick={handleDismissClick}>
          Schließen
        </button>
      </div>
    </div>
  );
};

export default InstallPwaPrompt;