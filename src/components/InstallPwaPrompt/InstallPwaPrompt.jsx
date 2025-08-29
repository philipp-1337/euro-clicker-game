
import React from 'react';
import { usePwaPrompt } from '../../hooks/usePwaPrompt';
import { ShareIcon, SquarePlusIcon, X as CloseIcon } from 'lucide-react';
import { isLocalhost } from '@utils/env';

const InstallPwaPrompt = () => {
  const {
    showInstallPrompt,
    isIos,
    handleInstallClick,
    handleDismissClick,
  } = usePwaPrompt();

  // const showInstallPrompt = true;

  // Prevent prompt on localhost unless forced
  if ((!showInstallPrompt || (isLocalhost()))) return null;

  if (!showInstallPrompt) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div className="settings-modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h3 style={{ flexGrow: 1 }}>Install App</h3>
          <button 
            className="settings-button" 
            onClick={handleDismissClick} 
            title="Close" 
            aria-label="Close"
            style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
          {isIos ? (
            <>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                To install this app on your device, tap on the <b>Share</b> menu and then <b>Add to Home Screen</b>.
              </p>
              <div className="pwa-prompt-icons">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ShareIcon size={20} color="#5f9ea0" />
                <span className="pwa-prompt-icon-label">Teilen</span>
              </div>
              <span>&rarr;</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SquarePlusIcon size={20} color="#5f9ea0" />
                <span className="pwa-prompt-icon-label">Home</span>
              </div>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                Do you like the game?<br />Install it for the best experience!
              </p>
            </>
          )}
        </div>
        <div className="modal-actions" style={{ justifyContent: 'center', position: 'relative' }}>
          {!isIos && (
            <button className="modal-btn" onClick={handleInstallClick}>
              Install
            </button>
          )}
          <button className="modal-btn" onClick={handleDismissClick}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaPrompt;