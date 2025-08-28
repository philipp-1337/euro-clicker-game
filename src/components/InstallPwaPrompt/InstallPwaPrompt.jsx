import React from 'react';
import { usePwaPrompt } from '../../hooks/usePwaPrompt';
import '../../scss/components/_pwa-prompt.scss';

const InstallPwaPrompt = () => {
  const { showInstallPrompt, isIos, handleInstallClick, handleDismissClick } = usePwaPrompt();

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="pwa-prompt">
      <div className="pwa-prompt-content">
        {isIos ? (
          <div>
            <p>To install this app on your device, tap the 'Share' icon and then 'Add to Home Screen'.</p>
            {/* Optionally, add icons here */}
          </div>
        ) : (
          <div>
            <p>Enjoying the game? Install it on your device for the best experience!</p>
            <button className="btn btn-primary" onClick={handleInstallClick}>Install App</button>
          </div>
        )}
        <button className="btn btn-secondary" onClick={handleDismissClick}>Dismiss</button>
      </div>
    </div>
  );
};

export default InstallPwaPrompt;