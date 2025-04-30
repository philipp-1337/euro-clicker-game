import { useState, useEffect, useCallback } from 'react';
import { gameConfig } from '@constants/gameConfig';

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
      achievements: {},
      showPlaytime: true,      // <--- Default: eingeblendet
      showClickStats: false,   // <--- Default: ausgeblendet
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
      const nextClicks = (prev.floatingClicks || 0) + 1;
      const nextAchievements = { ...prev.achievements };
      let achievementUnlocked = false;

      // Hole die benötigten Klicks aus gameConfig
      const clicks100Config = gameConfig.achievements.find(a => a.id === 'clicks100');
      const requiredClicks = clicks100Config?.requiredClicks ?? 1000;

      if (!nextAchievements.clicks100 && nextClicks >= requiredClicks) {
        nextAchievements.clicks100 = true;
        achievementUnlocked = true;
      }
      // Add more achievements here if needed
      const next = { ...prev, floatingClicks: nextClicks, achievements: nextAchievements };
      saveUiProgress(next);
      // Notify achievement unlock (for banner)
      if (achievementUnlocked && window && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('game:achievement', { detail: { id: 'clicks100' } }));
      }
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

  return {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
    cloudSaveMode,
    setCloudSaveMode,
    achievements: uiProgress.achievements || {},
    showPlaytime: typeof uiProgress.showPlaytime === 'boolean' ? uiProgress.showPlaytime : true,
    setShowPlaytime,
    showClickStats: typeof uiProgress.showClickStats === 'boolean' ? uiProgress.showClickStats : false,
    setShowClickStats,
  };
}
