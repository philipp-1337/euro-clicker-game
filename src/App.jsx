import { useState, useEffect, useRef } from 'react';
import ClickerGame from '@components/ClickerGame';
import UpdateBanner from '@components/UpdateBanner';
import VersionDisplay from './components/VersionDisplay/VersionDisplay';
import InstallPwaPrompt from './components/InstallPwaPrompt/InstallPwaPrompt';
import './scss/components/_money-banner.scss';
import './scss/components/_displays.scss';
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {
  const {
    needRefresh: [
      needRefresh
    ],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  // Initialisiere easyMode basierend auf localStorage
  const [easyMode, setEasyMode] = useState(localStorage.getItem('easyMode') === 'true');
  const saveGameRef = useRef(null); // Ref für die saveGame Funktion
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  // Audio settings states
  const [musicEnabled, setMusicEnabled] = useState((localStorage.getItem('musicEnabled') ?? 'true') === 'true');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState((localStorage.getItem('soundEffectsEnabled') ?? 'true') === 'true');


        // Darkmode direkt beim App-Start setzen
        useEffect(() => {
          const getInitialDarkMode = () => {
            try {
              const saveRaw = localStorage.getItem('clickerSave');
              if (saveRaw) {
                const save = JSON.parse(saveRaw);
                if (typeof save.darkMode === 'boolean') return save.darkMode;
              }
            } catch (e) {
              console.error('Error reading darkMode from clickerSave:', e);
            }
            const localStorageValue = localStorage.getItem('darkMode');
            if (localStorageValue === 'true') return true;
            if (localStorageValue === 'false') return false;
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          };
          if (getInitialDarkMode()) {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
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

  // Handler für Easy-mode-Toggle
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

    updateServiceWorker(true);
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
      >
        <track kind="captions" label="Background music" srcLang="en" />
      </audio>
      {needRefresh && <UpdateBanner onUpdate={handleUpdate} />}
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
      <InstallPwaPrompt />
    </div>
  );
}

export default App;
