import { useState, useEffect, useRef, useCallback } from 'react';
import useCloudSave from '@hooks/useCloudSave';

export default function useGameHeaderLogic(props) {
  const {
    money,
    easyMode,
    onEasyModeToggle,
    playTime,
    onSaveGame,
    totalMoneyPerSecond,
    floatingClicks,
    gameState,
    onImportCloudSave,
    leaderboardMode, // Add this line
  } = props;

  const [environment, setEnvironment] = useState('production');
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('beta')) setEnvironment('beta');
    else if (hostname.includes('alpha')) setEnvironment('alpha');
    else if (hostname === 'localhost' || hostname === '127.0.0.1') setEnvironment('localhost');
    else setEnvironment('production');
  }, []);

  const toggleEasyMode = useCallback(() => {
    if (onEasyModeToggle) onEasyModeToggle(!easyMode);
  }, [onEasyModeToggle, easyMode]);

  const renderEnvironmentLabel = useCallback(() => {
    if (environment === 'production' && !leaderboardMode) return null;
    let labelText = environment;

    if (leaderboardMode) {
      // In production nur "Leaderboard" anzeigen
      const display = environment === 'production' ? 'Leaderboard' : `${labelText} (Leaderboard)`;
      return (
        <span
          className={`env-label ${environment} leaderboard-mode`}
          title="Leaderboard Mode active"
          style={{ cursor: 'not-allowed', opacity: 0.7 }}
        >
          {display}
        </span>
      );
    }

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
  }, [environment, easyMode, toggleEasyMode, leaderboardMode]);

  const formatPlayTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 || hours > 0 ? `${minutes}m` : null,
      `${seconds}s`
    ].filter(Boolean).join(' ');
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showStats, setShowStats] = useState(false);

  const {
    cloudUuid,
    exportToCloud,
    importFromCloud,
  } = useCloudSave();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUuid, setImportUuid] = useState('');
  const [importError, setImportError] = useState('');
  const [showCloudSaveDisableConfirm, setShowCloudSaveDisableConfirm] = useState(false);

  const triggerSaveFeedback = useCallback((message = 'Game saved') => {
    setSaveMessage(message);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('');
    }, 1500);
  }, []);

  const cloudSaveInProgress = useRef(false);
  const [cloudSaveMode, setCloudSaveMode] = useState(() => {
    // Try to load from clickerUiProgress in localStorage
    try {
      const raw = localStorage.getItem('clickerUiProgress');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.cloudSaveMode === 'boolean') return parsed.cloudSaveMode;
      }
    } catch {}
    return false;
  });

  // Listen for cloudSaveMode changes from UI (for persistence)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail && typeof e.detail.cloudSaveMode === 'boolean') {
        const next = e.detail.cloudSaveMode;
        if (!next && cloudUuid) {
          // Wenn Cloud Save deaktiviert wird, zeige Bestätigungsdialog
          setShowCloudSaveDisableConfirm(true);
        } else {
          setCloudSaveMode(next);
        }
      }
    };
    window.addEventListener('game:cloudsavemode', handler);
    return () => window.removeEventListener('game:cloudsavemode', handler);
  }, [cloudUuid]);

  // Persist cloudSaveMode in clickerUiProgress on change
  useEffect(() => {
    try {
      const raw = localStorage.getItem('clickerUiProgress');
      const prev = raw ? JSON.parse(raw) : {};
      if (prev.cloudSaveMode !== cloudSaveMode) {
        localStorage.setItem('clickerUiProgress', JSON.stringify({ ...prev, cloudSaveMode }));
      }
    } catch {}
  }, [cloudSaveMode]);

  // Cloud Save Export Handler
  const handleExportCloud = useCallback(async (silent = false) => {
    try {
      cloudSaveInProgress.current = true;
      if (onSaveGame) onSaveGame();
      await exportToCloud(gameState);
      if (!silent) triggerSaveFeedback('Cloud saved');
    } catch {
      if (!silent) triggerSaveFeedback('Cloud save failed');
    } finally {
      setTimeout(() => { cloudSaveInProgress.current = false; }, 500);
    }
  }, [onSaveGame, exportToCloud, gameState, triggerSaveFeedback]);

  // Save Button Handler (lokal oder Cloud je nach Modus)
  const handleSave = useCallback(() => {
    if (cloudSaveMode) {
      handleExportCloud();
    } else {
      onSaveGame();
      triggerSaveFeedback('Saved');
    }
  }, [cloudSaveMode, handleExportCloud, onSaveGame, triggerSaveFeedback]);

  // Cloud Save Import Handler
  const handleImportCloud = useCallback(async () => {
    setImportError('');
    try {
      const data = await importFromCloud(importUuid.trim());
      if (onImportCloudSave) onImportCloudSave(data);
      setShowImportDialog(false);
      triggerSaveFeedback('Cloud loaded');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      setImportError('Not found or error');
    }
  }, [importFromCloud, importUuid, onImportCloudSave, triggerSaveFeedback]);

  const [showUuid, setShowUuid] = useState(false);

  // Autosave-Handling
  useEffect(() => {
    const handleAutoSave = () => {
      if (cloudSaveInProgress.current) return;
      if (cloudSaveMode) {
        handleExportCloud(true);
        triggerSaveFeedback('Auto-saved');
      } else {
        triggerSaveFeedback('Auto-saved');
      }
    };
    window.addEventListener('game:autosaved', handleAutoSave);
    return () => window.removeEventListener('game:autosaved', handleAutoSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudSaveMode, gameState, handleExportCloud, triggerSaveFeedback]);

  return {
    environment,
    renderEnvironmentLabel,
    formatPlayTime,
    isSaving,
    saveMessage,
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
    onSaveGame,
    gameState,
    showCloudSaveDisableConfirm,
    setShowCloudSaveDisableConfirm,
  };
}
