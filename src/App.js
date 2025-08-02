import React, { useState, useEffect, useRef } from 'react'; // Importiere useRef
import ClickerGame from '@components/ClickerGame';
import UpdateBanner from '@components/UpdateBanner';
import VersionDisplay from './components/VersionDisplay/VersionDisplay';
import './scss/components/_money-banner.scss';
import './scss/components/_displays.scss';

function App() {
  // Initialisiere easyMode basierend auf localStorage
  const [easyMode, setEasyMode] = useState(localStorage.getItem('easyMode') === 'true');
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const saveGameRef = useRef(null); // Ref für die saveGame Funktion
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  // Audio settings states
  const [musicEnabled, setMusicEnabled] = useState((localStorage.getItem('musicEnabled') ?? 'true') === 'true');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState((localStorage.getItem('soundEffectsEnabled') ?? 'true') === 'true');


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

  // Listener für das Event, das bei manipulierten Speicherdaten ausgelöst wird
  useEffect(() => {
    const handleTampering = (event) => {
      let message = "Your save data was corrupted or manipulated. The game has been reset."; // Standardnachricht
      if (event.detail && event.detail.message) {
        message = `${event.detail.message} Your game has been reset.`;
      } else if (event.detail && event.detail.reason) {
        // Fallback, falls nur der Grund angegeben ist
        const reasonText = event.detail.reason === 'parse_error' ? 'Data format error' :
                           event.detail.reason === 'checksum_mismatch' ? 'Checksum error' :
                           'Unknown error';
        message = `Due to a problem with your save data (${reasonText}), the game has been reset.`;
      }
      // Hier könntest du eine schönere Benachrichtigung einbauen (Toast, Modal etc.)
      alert(message);
    };
    window.addEventListener('gamestateTampered', handleTampering);
    return () => {
      window.removeEventListener('gamestateTampered', handleTampering);
    };
  }, []);

  // Optional: Start music on first user interaction if autoplay is blocked
  useEffect(() => {
    if (musicPlaying && musicEnabled && audioRef.current) {
      audioRef.current.play().catch(error => console.warn("Music play failed:", error));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [musicPlaying, musicEnabled]);

  useEffect(() => {
    localStorage.setItem('musicEnabled', musicEnabled.toString());
  }, [musicEnabled]);

  useEffect(() => {
    localStorage.setItem('soundEffectsEnabled', soundEffectsEnabled.toString());
  }, [soundEffectsEnabled]);

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
      {/* Background music */}
      <audio
        ref={audioRef}
        src="/sounds/background-music.mp3"
        loop
        style={{ display: 'none' }}
      />
      {showUpdateBanner && <UpdateBanner onUpdate={handleUpdate} />}
      <ClickerGame
        easyMode={easyMode}
        onEasyModeToggle={handleEasyModeToggle}
        registerSaveGameHandler={registerSaveGameHandler}
        musicPlaying={musicPlaying}
        setMusicPlaying={setMusicPlaying}
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        soundEffectsEnabled={soundEffectsEnabled}
        setSoundEffectsEnabled={setSoundEffectsEnabled}
      />
      <VersionDisplay />
    </div>
  );
}

export default App;