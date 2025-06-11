import { useState, useEffect, useCallback } from 'react';

const UI_PROGRESS_KEY = 'clickerUiProgress';

function loadUiProgress() {
  try {
    const raw = localStorage.getItem(UI_PROGRESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUiProgress(progress) {
  try {
    localStorage.setItem(UI_PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

export function useUiProgress() {
  const [uiProgress, setUiProgress] = useState(() => {
    // Beim Laden: cloudSaveMode aus clickerSave übernehmen, falls vorhanden
    const progress = loadUiProgress() || {
      gameStarted: false,
      clickedButtons: [false, false, false, false, false],
      floatingClicks: 0,
      cloudSaveMode: false,
      showPlaytime: true,      // <--- Default: eingeblendet
      showClickStats: false,   // <--- Default: ausgeblendet
      showLeaderboard: true,   // <--- Default: Leaderboard-Button sichtbar
      showAchievementsHeaderButton: true, // Default: Achievements button in header is visible
      showStatisticsHeaderButton: false,  // Default: Statistics button in header is hidden
      prestigeButtonEverVisible: false, // New: Tracks if the prestige button has ever been visible
    };
    try {
      const clickerSaveRaw = localStorage.getItem('clickerSave');
      if (clickerSaveRaw) {
        const clickerSave = JSON.parse(clickerSaveRaw);
        if (typeof clickerSave.cloudSaveMode === 'boolean' && typeof progress.cloudSaveMode !== 'boolean') {
          progress.cloudSaveMode = clickerSave.cloudSaveMode;
        }
      }
    } catch {}
    return progress;
  });

  // floatingClicks als eigene Variable für einfacheren Zugriff
  const floatingClicks = uiProgress.floatingClicks || 0;

  // CloudSaveMode als eigene Variable
  const cloudSaveMode = typeof uiProgress.cloudSaveMode === 'boolean' ? uiProgress.cloudSaveMode : false;

  // Save to localStorage on change (inkl. cloudSaveMode auch in clickerSave speichern)
  useEffect(() => {
    saveUiProgress(uiProgress);
    // cloudSaveMode auch in clickerSave persistieren, falls vorhanden
    try {
      const clickerSaveRaw = localStorage.getItem('clickerSave');
      if (clickerSaveRaw) {
        const clickerSave = JSON.parse(clickerSaveRaw);
        if (clickerSave.cloudSaveMode !== cloudSaveMode) {
          localStorage.setItem('clickerSave', JSON.stringify({ ...clickerSave, cloudSaveMode }));
        }
      }
    } catch {}
  }, [uiProgress, cloudSaveMode]);

  // Setze Spielstart
  const setGameStarted = useCallback(() => {
    setUiProgress(prev => {
      if (prev.gameStarted) return prev;
      const next = { ...prev, gameStarted: true };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setze Button als geklickt
  const setButtonClicked = useCallback((index) => {
    setUiProgress(prev => {
      if (prev.clickedButtons[index]) return prev;
      const updated = [...prev.clickedButtons];
      updated[index] = true;
      const next = { ...prev, clickedButtons: updated };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // FloatingClickButton Klicks erhöhen
  const incrementFloatingClicks = useCallback(() => {
    setUiProgress(prev => {
      const next = { ...prev, floatingClicks: (prev.floatingClicks || 0) + 1 };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // CloudSaveMode setzen (korrektes Updater-Pattern)
  const setCloudSaveMode = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.cloudSaveMode === 'boolean' ? prev.cloudSaveMode : false;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, cloudSaveMode: nextValue };
      saveUiProgress(next);
      // cloudSaveMode auch direkt in clickerSave persistieren, falls vorhanden
      try {
        const clickerSaveRaw = localStorage.getItem('clickerSave');
        if (clickerSaveRaw) {
          const clickerSave = JSON.parse(clickerSaveRaw);
          if (clickerSave.cloudSaveMode !== nextValue) {
            localStorage.setItem('clickerSave', JSON.stringify({ ...clickerSave, cloudSaveMode: nextValue }));
          }
        }
      } catch {}
      return next;
    });
  }, []);

  // Sync cloudSaveMode from external event (GameHeader)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail && typeof e.detail.cloudSaveMode === 'boolean') {
        setCloudSaveMode(e.detail.cloudSaveMode);
      }
    };
    window.addEventListener('game:cloudsavemode', handler);
    return () => window.removeEventListener('game:cloudsavemode', handler);
  }, [setCloudSaveMode]);

  // Setter für showPlaytime
  const setShowPlaytime = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.showPlaytime === 'boolean' ? prev.showPlaytime : true;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, showPlaytime: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setter für showLeaderboard
  const setShowLeaderboard = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.showLeaderboard === 'boolean' ? prev.showLeaderboard : true;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, showLeaderboard: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setter for prestigeButtonEverVisible
  const setPrestigeButtonEverVisible = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.prestigeButtonEverVisible === 'boolean' ? prev.prestigeButtonEverVisible : false;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, prestigeButtonEverVisible: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setter für showClickStats
  const setShowClickStats = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.showClickStats === 'boolean' ? prev.showClickStats : false;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, showClickStats: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setter for showAchievementsHeaderButton
  const setShowAchievementsHeaderButton = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.showAchievementsHeaderButton === 'boolean' ? prev.showAchievementsHeaderButton : true;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, showAchievementsHeaderButton: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  // Setter for showStatisticsHeaderButton
  const setShowStatisticsHeaderButton = useCallback((valueOrUpdater) => {
    setUiProgress(prev => {
      const prevValue = typeof prev.showStatisticsHeaderButton === 'boolean' ? prev.showStatisticsHeaderButton : false;
      const nextValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevValue)
        : valueOrUpdater;
      const next = { ...prev, showStatisticsHeaderButton: nextValue };
      saveUiProgress(next);
      return next;
    });
  }, []);

  return {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
    cloudSaveMode,
    setCloudSaveMode,
    showPlaytime: typeof uiProgress.showPlaytime === 'boolean' ? uiProgress.showPlaytime : true,
    setShowPlaytime,
    showClickStats: typeof uiProgress.showClickStats === 'boolean' ? uiProgress.showClickStats : false,
    setShowClickStats,
    showLeaderboard: typeof uiProgress.showLeaderboard === 'boolean' ? uiProgress.showLeaderboard : true,
    setShowLeaderboard,
    showAchievementsHeaderButton: typeof uiProgress.showAchievementsHeaderButton === 'boolean' ? uiProgress.showAchievementsHeaderButton : true,
    setShowAchievementsHeaderButton,
    showStatisticsHeaderButton: typeof uiProgress.showStatisticsHeaderButton === 'boolean' ? uiProgress.showStatisticsHeaderButton : false,
    prestigeButtonEverVisible: typeof uiProgress.prestigeButtonEverVisible === 'boolean' ? uiProgress.prestigeButtonEverVisible : false,
    setPrestigeButtonEverVisible, // Export the setter
    setShowStatisticsHeaderButton,
  };
}
