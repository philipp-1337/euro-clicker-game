import { useState, useEffect, useRef, useCallback } from 'react';
import ClickerGame from '@components/ClickerGame';
// import UpdateBanner from '@components/UpdateBanner';
// import InstallPwaPrompt from './components/InstallPwaPrompt/InstallPwaPrompt';
// import BetaEndBanner from './components/BetaEndBanner/BetaEndBanner';
import { Toaster, toast } from 'sonner';
import { usePwaPrompt } from '@hooks/usePwaPrompt';
import { ShareIcon, SquarePlusIcon } from 'lucide-react';
import './scss/components/_money-banner.scss';
import './scss/components/_displays.scss';
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {
  const { showInstallPrompt, isIos, handleInstallClick, handleDismissClick } = usePwaPrompt();
  const {
    needRefresh: [needRefresh],
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
      toast.error(message, { duration: 8000, id: 'tamper-toast', className: 'tamper-toast' });
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
  const handleUpdate = useCallback(() => {
    // Zuerst speichern
    if (saveGameRef.current) {
      console.log('Saving game before update...');
      saveGameRef.current(); // Rufe die gespeicherte saveGame Funktion auf
    } else {
      console.warn('saveGame function not available for pre-update save.');
    }

    updateServiceWorker(true);
  }, [updateServiceWorker]);

  // Callback, um die saveGame Funktion von ClickerGame zu erhalten
  const registerSaveGameHandler = (saveFn) => {
    saveGameRef.current = saveFn;
  };

  // Update-Toast anzeigen, solange needRefresh true ist
  useEffect(() => {
    if (needRefresh) {
      toast(
        <span>
          A new version of the game is available!
          <button
            style={{ marginLeft: 12 }}
            onClick={handleUpdate}
            className="update-toast-btn"
          >
            Save & Refresh
          </button>
        </span>,
        {
          duration: Infinity,
          className: 'update-toast',
        }
      );
    }
  }, [needRefresh, handleUpdate]);

  // PWA Install-Toast anzeigen, wenn showInstallPrompt true ist
  useEffect(() => {
    if (showInstallPrompt) {
      toast(
        isIos ? (
          <span>
            To install this app, tap <ShareIcon size={18} style={{verticalAlign:'middle'}} /> and then <SquarePlusIcon size={18} style={{verticalAlign:'middle'}} /> Add to Home Screen.
            <button
              onClick={() => {
                handleDismissClick();
                toast.dismiss('pwa-toast');
              }}
              className="pwa-toast-btn"
              style={{ marginLeft: 12 }}
            >Dismiss</button>
          </span>
        ) : (
          <span>
            Do you like the game?&nbsp;
            <button
              onClick={handleInstallClick}
              className="pwa-toast-btn"
            >Install</button>
            <button
              onClick={() => {
                handleDismissClick();
                toast.dismiss('pwa-toast');
              }}
              className="pwa-toast-btn"
            >Dismiss</button>
          </span>
        ),
        {
          duration: Infinity,
          className: 'pwa-toast',
          id: 'pwa-toast',
        }
      );
    } else {
      toast.dismiss('pwa-toast');
    }
  }, [showInstallPrompt, isIos, handleInstallClick, handleDismissClick]);

  // Beta-Ende-Toast anzeigen, wenn auf Beta-Umgebung
  useEffect(() => {
    const isBeta = window.location.hostname.includes('beta') || window.location.hostname.includes("localhost") || window.location.hostname.includes("alpha");
    if (isBeta) {
      toast(
        <span>
           The Beta will be shut down soon and will no longer be updated. Please switch to euro-clicker-game.web.app (you may need to clear your cache). You can transfer your progress via the Cloud Save feature in Settings.
        </span>,
        {
          duration: Infinity,
          className: 'beta-toast',
        }
      );
    }
  }, []);

  return (
    <>
      <Toaster
        richColors={true}
        position="top-center"
        mobileOffset={32}
        offset={32}
        closeButton={false}
        expand={false}
        invert={false}
        gap={16}
      />
      <div className="App">
        {/* BetaEndBanner entfernt, Toast übernimmt */}
        {/* Background music */}
        <audio
          ref={audioRef}
          src="/sounds/background-music-quiet.mp3"
          loop
          style={{ display: 'none' }}
        >
          <track kind="captions" label="Background music" srcLang="en" />
        </audio>
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
      </div>
    </>
  );
}

export default App;
