import { useState, useEffect, useRef, useCallback } from 'react';
import useCloudSave from '@hooks/useCloudSave';
import { formatPlaytime } from '../utils/calculators';

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
  } = props;

  const [environment, setEnvironment] = useState('production');
  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('beta')) setEnvironment('beta');
    else if (hostname.includes('alpha')) setEnvironment('alpha');
    else if (hostname === 'localhost' || hostname === '127.0.0.1') setEnvironment('localhost');
    else setEnvironment('production');
  }, []);

  // Hilfsfunktion: Easy Mode darf nur in localhost und alpha aktiviert werden
  const canToggleEasyMode = environment === 'localhost' || environment === 'alpha';

  const toggleEasyMode = useCallback(() => {
    if (canToggleEasyMode && onEasyModeToggle) onEasyModeToggle(!easyMode);
  }, [canToggleEasyMode, onEasyModeToggle, easyMode]);

  const renderEnvironmentLabel = useCallback(() => {
    if (environment === 'production') return null;
    let labelText = environment;
    const displayText = easyMode ? `${labelText} (easy)` : labelText;
    return (
      <span
        className={`env-label ${environment}`}
        onClick={canToggleEasyMode ? toggleEasyMode : undefined}
        title={canToggleEasyMode ? "Toggle Easy Mode" : "Easy Mode only available in localhost and alpha"}
        style={!canToggleEasyMode ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        {displayText}
      </span>
    );
  }, [environment, easyMode, toggleEasyMode, canToggleEasyMode]);

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
    formatPlaytime,
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