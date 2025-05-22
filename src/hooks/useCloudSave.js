import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Hilfsfunktion für UUID
function generateUUID() {
  // RFC4122 v4 compliant
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const CLICKER_SAVE_KEY = 'clickerSave';
const UI_PROGRESS_KEY = 'clickerUiProgress';
const START_TIME_KEY = 'startTime';

export default function useCloudSave() {
  const [cloudUuid, setCloudUuid] = useState(() => {
    return localStorage.getItem('cloudSaveUuid') || null;
  });
  const [cloudStatus, setCloudStatus] = useState(null);

  // Exportiere Spielstand in die Cloud (Firestore)
  const exportToCloud = async (gameState) => {
    let uuid = cloudUuid;
    if (!uuid) {
      uuid = generateUUID();
      localStorage.setItem('cloudSaveUuid', uuid);
      setCloudUuid(uuid);
    }
    setCloudStatus('saving');
    try {
      // Hole zusätzliche Daten aus LocalStorage
      let clickerSave = localStorage.getItem(CLICKER_SAVE_KEY) || null;
      // --- PATCH: darkMode in clickerSave sicherstellen ---
      try {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode !== null) {
          let saveObj = clickerSave ? JSON.parse(clickerSave) : {};
          if (saveObj.darkMode !== (darkMode === 'true')) {
            saveObj.darkMode = (darkMode === 'true');
            clickerSave = JSON.stringify(saveObj);
            localStorage.setItem(CLICKER_SAVE_KEY, clickerSave);
          }
        }
      } catch {}
      // --- ENDE PATCH ---
      let clickerUiProgress = localStorage.getItem(UI_PROGRESS_KEY) || null;
      let startTime = localStorage.getItem(START_TIME_KEY) || null;
      let achievementNotificationsSeen = localStorage.getItem('achievementNotificationsSeen') || null;
      // --- LEADERBOARD PATCH: leaderboardMode & leaderboardName ---
      const leaderboardMode = localStorage.getItem('leaderboardMode');
      const leaderboardName = localStorage.getItem('leaderboardName');
      // --- ENDE LEADERBOARD PATCH ---
      // --- LEADERBOARD CHECKPOINTS PATCH ---
      const leaderboardCheckpointsReached = localStorage.getItem('leaderboardCheckpointsReached');
      // --- ENDE LEADERBOARD CHECKPOINTS PATCH ---
      // Hole Audio-Einstellungen aus LocalStorage
      const musicEnabledSetting = localStorage.getItem('musicEnabled');
      const soundEffectsEnabledSetting = localStorage.getItem('soundEffectsEnabled');

      await setDoc(doc(db, 'saves', uuid), {
        ...gameState,
        updatedAt: Date.now(),
        clickerSave,
        clickerUiProgress,
        startTime,
        achievementNotificationsSeen,
        leaderboardMode,
        leaderboardName,
        leaderboardCheckpointsReached,
        musicEnabledSetting,
        soundEffectsEnabledSetting,
      });
      setCloudStatus('saved');
      return uuid;
    } catch (e) {
      setCloudStatus('error');
      throw e;
    }
  };

  // Importiere Spielstand aus der Cloud (Firestore)
  const importFromCloud = async (uuid) => {
    setCloudStatus('loading');
    try {
      const snap = await getDoc(doc(db, 'saves', uuid));
      if (!snap.exists()) throw new Error('Not found');
      const data = snap.data();
      setCloudStatus('loaded');
      localStorage.setItem('cloudSaveUuid', uuid);
      setCloudUuid(uuid);

      // Schreibe die LocalStorage-Daten zurück
      if (data.clickerSave) localStorage.setItem(CLICKER_SAVE_KEY, data.clickerSave);
      if (data.clickerUiProgress) localStorage.setItem(UI_PROGRESS_KEY, data.clickerUiProgress);
      if (data.startTime) localStorage.setItem(START_TIME_KEY, data.startTime);
      if (data.achievementNotificationsSeen) localStorage.setItem('achievementNotificationsSeen', data.achievementNotificationsSeen);
      // --- LEADERBOARD PATCH: leaderboardMode & leaderboardName ---
      if (data.leaderboardMode !== undefined && data.leaderboardMode !== null) {
        localStorage.setItem('leaderboardMode', data.leaderboardMode);
      }
      if (data.leaderboardName !== undefined && data.leaderboardName !== null) {
        localStorage.setItem('leaderboardName', data.leaderboardName);
      }
      // --- ENDE LEADERBOARD PATCH ---
      // --- LEADERBOARD CHECKPOINTS PATCH ---
      if (data.leaderboardCheckpointsReached) localStorage.setItem('leaderboardCheckpointsReached', data.leaderboardCheckpointsReached);
      // --- ENDE LEADERBOARD CHECKPOINTS PATCH ---
      // Schreibe Audio-Einstellungen zurück in LocalStorage
      if (data.musicEnabledSetting !== undefined && data.musicEnabledSetting !== null) {
        localStorage.setItem('musicEnabled', data.musicEnabledSetting);
      }
      if (data.soundEffectsEnabledSetting !== undefined && data.soundEffectsEnabledSetting !== null) {
        localStorage.setItem('soundEffectsEnabled', data.soundEffectsEnabledSetting);
      }

      // Dark Mode nach Import anwenden
      try {
        if (data.clickerSave) {
          const save = JSON.parse(data.clickerSave);
          if (typeof save.darkMode === 'boolean') {
            // Event für Dark Mode Änderung dispatchen
            window.dispatchEvent(new Event('game:cloudimported'));
          }
        }
      } catch {}

      // Entferne Firestore-Metadaten und Zusatzdaten für den eigentlichen Spielzustand
      const {
        updatedAt,
        clickerSave,
        clickerUiProgress,
        startTime,
        achievementNotificationsSeen,
        leaderboardMode,
        leaderboardName,
        leaderboardCheckpointsReached,
        musicEnabledSetting,
        soundEffectsEnabledSetting,
        ...gameStateForApp
      } = data;
      return gameStateForApp;
    } catch (e) {
      setCloudStatus('error');
      throw e;
    }
  };

  // Lösche Spielstand aus der Cloud (Firestore)
  const deleteFromCloud = async (uuid) => {
    if (!uuid) return;
    setCloudStatus('deleting');
    try {
      await deleteDoc(doc(db, 'saves', uuid));
      localStorage.removeItem('cloudSaveUuid');
      setCloudUuid(null);
      setCloudStatus('deleted');
    } catch (e) {
      setCloudStatus('error');
      throw e;
    }
  };

  return {
    cloudUuid,
    exportToCloud,
    importFromCloud,
    deleteFromCloud,
    cloudStatus,
    setCloudUuid,
  };
}
