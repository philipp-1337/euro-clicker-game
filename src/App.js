import React, { useState, useEffect, useRef } from 'react'; // Importiere useRef
import ClickerGame from '@components/ClickerGame';
import UpdateBanner from '@components/UpdateBanner';

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

  // // TEST: Banner manuell anzeigen (nur für lokale Entwicklung)
  // const triggerTestUpdateBanner = () => {
  //   // Simuliere ein Service Worker Update-Event
  //   window.dispatchEvent(new CustomEvent('swUpdateReady', { detail: { waiting: { postMessage: () => {} } } }));
  // };

  return (
    <div className="App">
      {/* TEST-BUTTON NUR LOKAL */}
      {/* {window.location.hostname === 'localhost' && (
        <button style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }} onClick={triggerTestUpdateBanner}>
          Test Update-Banner
        </button>
      )} */}
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