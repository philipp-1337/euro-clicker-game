import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import useCloudSave from '@hooks/useCloudSave';
import { formatPlaytime } from '@utils/calculators';
import { isLocalhost } from '@utils/env';
import { APP_VERSION } from '../version';

export default function useGameHeaderLogic(props) {
  const {
    money,
    easyMode,
    onEasyModeToggle,
    playTime,
    onSaveGame,
    totalMoneyPerSecond,
    manualMoneyPerSecond, // Add this prop
    floatingClicks,
    gameState,
    onImportCloudSave,
    // Prestige related props from ClickerGame (props passed to GameHeader)
    currentRunShares,
    prestigeShares,
    prestigeGame,
    canPrestige,
    prestigeBonusMultiplier,
  } = props;

  const [environment, setEnvironment] = useState("production");
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes("alpha")) setEnvironment("alpha");
    else if (isLocalhost()) setEnvironment("localhost");
    else setEnvironment("production");
  }, []);

  // Easy Mode darf nur in localhost und alpha aktiviert werden (NICHT in production!)
  const canToggleEasyMode =
    environment === "localhost" || environment === "alpha";

  const toggleEasyMode = useCallback(() => {
    if (canToggleEasyMode && onEasyModeToggle) onEasyModeToggle(!easyMode);
  }, [canToggleEasyMode, onEasyModeToggle, easyMode]);

  const renderEnvironmentLabel = useCallback(() => {
    const versionText = `v${APP_VERSION}`;
    if (environment === "production") {
      return <span className="env-label production">{versionText}</span>;
    }

    const labelText = environment;
    const displayText = easyMode
      ? `${labelText} (easy) ${versionText}`
      : `${labelText} ${versionText}`;
    return (
      <span
        className={`env-label ${environment}`}
        role="button"
        tabIndex={canToggleEasyMode ? 0 : -1}
        onClick={canToggleEasyMode ? toggleEasyMode : undefined}
        onKeyDown={
          canToggleEasyMode
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") toggleEasyMode();
              }
            : undefined
        }
        title={
          canToggleEasyMode
            ? "Toggle Easy Mode"
            : "Easy Mode only available in localhost and alpha"
        }
        style={
          !canToggleEasyMode ? { opacity: 0.5, cursor: "not-allowed" } : {}
        }
        aria-disabled={!canToggleEasyMode}
      >
        {displayText}
      </span>
    );
  }, [environment, easyMode, toggleEasyMode, canToggleEasyMode]);

  // const [isSaving, setIsSaving] = useState(false);
  // const [saveMessage, setSaveMessage] = useState('');
  const [showStats, setShowStats] = useState(false);

  const { cloudUuid, exportToCloud, importFromCloud, setCloudUuid } = useCloudSave();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUuid, setImportUuid] = useState("");
  const [importError, setImportError] = useState("");
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] =
    useState(false);

  // Toast-Feedback mit Sonner
  const triggerSaveFeedback = useCallback(
    (message = "Game saved", type = "success") => {
      toast[type] ? toast[type](message) : toast(message);
    },
    []
  );

  const cloudSaveInProgress = useRef(false);
  const [cloudSaveMode, setCloudSaveMode] = useState(() => {
    // Try to load from clickerUiProgress in localStorage
    try {
      const raw = localStorage.getItem("clickerUiProgress");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.cloudSaveMode === "boolean")
          return parsed.cloudSaveMode;
      }
    } catch (e) {
      console.error("Error reading clickerUiProgress from localStorage:", e);
    }
    return false;
  });

  // Erzeuge Cloud-UUID sofort beim Aktivieren von Cloud Save
  useEffect(() => {
    if (cloudSaveMode && !cloudUuid && typeof window !== "undefined") {
      // UUID-Generator aus useCloudSave kopieren (RFC4122 v4)
      const generateUUID = () =>
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
          (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
          ).toString(16)
        );
      const uuid = generateUUID();
      localStorage.setItem("cloudSaveUuid", uuid);
      setCloudUuid(uuid);
    }
  }, [cloudSaveMode, cloudUuid, setCloudUuid]);

  // Listen for cloudSaveMode changes from UI (for persistence)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail && typeof e.detail.cloudSaveMode === "boolean") {
        const next = e.detail.cloudSaveMode;
        if (!next && cloudUuid) {
          // Wenn Cloud Save deaktiviert wird, zeige Bestätigungsdialog
          setShowCloudSaveDisableConfirm(true);
        } else {
          setCloudSaveMode(next);
        }
      }
    };
    window.addEventListener("game:cloudsavemode", handler);
    return () => window.removeEventListener("game:cloudsavemode", handler);
  }, [cloudUuid]);

  // Persist cloudSaveMode in clickerUiProgress on change
  useEffect(() => {
    try {
      const raw = localStorage.getItem("clickerUiProgress");
      const prev = raw ? JSON.parse(raw) : {};
      // Default-Werte ergänzen, falls Keys fehlen
      const defaults = {
        gameStarted: false,
        clickedButtons: [false, false, false, false, false],
        floatingClicks: 0,
        cloudSaveMode: false,
        showPlaytime: true,
        showClickStats: false,
        showLeaderboard: true,
        showAchievementsHeaderButton: true,
        showStatisticsHeaderButton: false,
        prestigeButtonEverVisible: false,
      };
      const merged = { ...defaults, ...prev, cloudSaveMode };
      localStorage.setItem("clickerUiProgress", JSON.stringify(merged));
    } catch (e) {
      console.error("Error writing clickerUiProgress to localStorage:", e);
    }
  }, [cloudSaveMode]);

  // Cloud Save Export Handler
  const handleExportCloud = useCallback(
    async (silent = false) => {
      try {
        cloudSaveInProgress.current = true;
        if (onSaveGame) onSaveGame();
        console.log(
          "[useGameHeaderLogic] Attempting cloud export with gameState:",
          gameState
        );
        await exportToCloud(gameState);
        if (silent) {
          triggerSaveFeedback("Auto-saved", "success");
        } else {
          triggerSaveFeedback("Cloud saved", "success");
        }
      } catch (error) {
        // Erweiterte Fehlerprotokollierung
        console.error("Cloud save failed. Raw error object:", error);
        let errorMessage = "Cloud save failed: Unknown error";
        if (error instanceof Error && error.message) {
          errorMessage = `Cloud save failed: ${error.message}`;
        } else if (typeof error === "string" && error) {
          errorMessage = `Cloud save failed: ${error}`;
        } else if (error && typeof error.toString === "function") {
          errorMessage = `Cloud save failed: ${error.toString()}`;
        }
        triggerSaveFeedback(errorMessage, "error");
      } finally {
        setTimeout(() => {
          cloudSaveInProgress.current = false;
        }, 500);
      }
    },
    [onSaveGame, exportToCloud, gameState, triggerSaveFeedback]
  );

  // Save Button Handler (lokal oder Cloud je nach Modus)
  const handleSave = useCallback(() => {
    if (cloudSaveMode) {
      handleExportCloud();
    } else {
      onSaveGame?.(true); // true = manuelles Speichern, damit das Event stimmt
    }
  }, [cloudSaveMode, handleExportCloud, onSaveGame]);

  // Cloud Save Import Handler
  const handleImportCloud = useCallback(async () => {
    setImportError("");
    try {
      const data = await importFromCloud(importUuid.trim());
      if (onImportCloudSave) onImportCloudSave(data);
      setShowImportDialog(false);
      triggerSaveFeedback("Cloud loaded", "success");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setImportError("Not found or error");
    }
  }, [importFromCloud, importUuid, onImportCloudSave, triggerSaveFeedback]);

  const [showUuid, setShowUuid] = useState(false);

  // Autosave-Handling: Nur bei Autosave "Auto-saved" Toast
  useEffect(() => {
    const handleAutoSave = () => {
      if (cloudSaveInProgress.current) return;
      if (cloudSaveMode) {
        handleExportCloud(true);
      }
      // Kein Toast mehr hier, Toast kommt nur über eigenen Event unten
    };
    window.addEventListener("game:autosaved", handleAutoSave);
    return () => window.removeEventListener("game:autosaved", handleAutoSave);
  }, [cloudSaveMode, gameState, handleExportCloud]);

  // Zeige Toasts für Autosave und manuelles Speichern getrennt (nur für Local Save)
  useEffect(() => {
    const showSavedToast = () => triggerSaveFeedback("Saved", "success");
    window.addEventListener("game:saved", showSavedToast);
    return () => {
      window.removeEventListener("game:saved", showSavedToast);
    };
  }, [triggerSaveFeedback]);

  return {
    environment,
    renderEnvironmentLabel,
    formatPlaytime,
    // isSaving,
    // saveMessage,
    showStats,
    setShowStats,
    showImportDialog,
    setShowImportDialog,
    importUuid,
    setImportUuid,
    importError,
    handleImportCloud,
    cloudSaveMode,
    setCloudSaveMode,
    handleSave,
    handleExportCloud,
    showUuid,
    setShowUuid,
    cloudUuid,
    floatingClicks,
    triggerSaveFeedback,
    money,
    easyMode,
    playTime,
    totalMoneyPerSecond,
    manualMoneyPerSecond,
    onSaveGame,
    gameState,
    showCloudSaveDisableConfirm,
    setShowCloudSaveDisableConfirm,
    // Return prestige related values
    currentRunShares,
    prestigeShares,
    prestigeGame,
    canPrestige,
    prestigeBonusMultiplier,
  };
}