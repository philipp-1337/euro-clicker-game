import React, { useState, useEffect, useRef } from 'react'; // Importiere useRef
import ClickerGame from '@components/ClickerGame';
import UpdateBanner from '@components/UpdateBanner';
import './scss/components/_money-banner.scss';

function App() {
  // Initialisiere easyMode basierend auf localStorage
  const [easyMode, setEasyMode] = useState(localStorage.getItem('easyMode') === 'true');
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const saveGameRef = useRef(null); // Ref für die saveGame Funktion

  useEffect(() => {
    const handleUpdateReady = (event) => {
      console.log('Update-Event empfangen:', event.detail);
      setWaitingWorker(event.detail.waiting);
      setShowUpdateBanner(true);
    };

    window.addEventListener('swUpdateReady', handleUpdateReady);

    return () => {
      window.removeEventListener('swUpdateReady', handleUpdateReady);
    };
  }, []);

  // Handler für Easy-Mode-Toggle
  const handleEasyModeToggle = (isEasyMode) => {
    setEasyMode(isEasyMode);
    localStorage.setItem('easyMode', isEasyMode.toString());
  };

  // Funktion zum Auslösen des Updates
  const handleUpdate = () => {
    // Zuerst speichern
    if (saveGameRef.current) {
      console.log('Saving game before update...');
      saveGameRef.current(); // Rufe die gespeicherte saveGame Funktion auf
    } else {
      console.warn('saveGame function not available for pre-update save.');
    }

    if (waitingWorker) {
      // Sende eine Nachricht an den wartenden Service Worker, um die Aktivierung zu starten
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Warte kurz, damit der SW aktivieren kann, bevor neu geladen wird
      // `clients.claim()` im SW sollte den Rest erledigen
      setShowUpdateBanner(false); // Banner ausblenden
      setTimeout(() => {
        window.location.reload();
      }, 100); // Kurze Verzögerung
    }
  };

  // Callback, um die saveGame Funktion von ClickerGame zu erhalten
  const registerSaveGameHandler = (saveFn) => {
    saveGameRef.current = saveFn;
  };

  return (
    <div className="App">
      {showUpdateBanner && <UpdateBanner onUpdate={handleUpdate} />}
      <ClickerGame
        easyMode={easyMode}
        onEasyModeToggle={handleEasyModeToggle}
        registerSaveGameHandler={registerSaveGameHandler}
      />
    </div>
  );
}

export default App;