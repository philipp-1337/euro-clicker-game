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
    return (
      loadUiProgress() || {
        gameStarted: false,
        clickedButtons: [false, false, false, false, false],
        floatingClicks: 0,
      }
    );
  });

  // floatingClicks als eigene Variable für einfacheren Zugriff
  const floatingClicks = uiProgress.floatingClicks || 0;

  // Save to localStorage on change
  useEffect(() => {
    saveUiProgress(uiProgress);
  }, [uiProgress]);

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

  return {
    uiProgress,
    setGameStarted,
    setButtonClicked,
    floatingClicks,
    incrementFloatingClicks,
  };
}
