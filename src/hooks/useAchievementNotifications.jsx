import { useState, useCallback, useEffect } from 'react';

/**
 * Kapselt die gesamte Achievement-Notification-Logik.
 * Übergib achievements, unlockedAchievements und clearUnlockedAchievements aus useAchievements.
 */
export default function useAchievementNotifications(achievements, unlockedAchievements, clearUnlockedAchievements) {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [showAchievement, setShowAchievement] = useState(null);

  // Hilfsfunktionen für Notification-Status
  const getSeenAchievementNotifications = useCallback(() => {
    try {
      const raw = localStorage.getItem('achievementNotificationsSeen');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, []);

  const markAchievementNotificationSeen = useCallback((id) => {
    try {
      const seen = getSeenAchievementNotifications();
      if (!seen.includes(id)) {
        const updated = [...seen, id];
        localStorage.setItem('achievementNotificationsSeen', JSON.stringify(updated));
      }
    } catch {}
  }, [getSeenAchievementNotifications]);

  const hasSeenAchievementNotification = useCallback((id) => {
    return getSeenAchievementNotifications().includes(id);
  }, [getSeenAchievementNotifications]);

  // Gibt true zurück, sobald mindestens ein Achievement freigeschaltet wurde
  const hasAnyAchievement = Object.values(achievements).some(a => a.unlocked);

  // Wenn neue Achievements freigeschaltet werden, zur Queue hinzufügen (nur wenn noch nicht gesehen)
  useEffect(() => {
    if (unlockedAchievements.length > 0) {
      const unseen = unlockedAchievements.filter(a => !hasSeenAchievementNotification(a.id));
      if (unseen.length > 0) {
        setNotificationQueue(prev => [...prev, ...unseen]);
      }
      clearUnlockedAchievements();
    }
  }, [unlockedAchievements, clearUnlockedAchievements, hasSeenAchievementNotification]);

  // Immer wenn showAchievement null wird und noch etwas in der Queue ist, das nächste anzeigen
  useEffect(() => {
    if (!showAchievement && notificationQueue.length > 0) {
      setShowAchievement(notificationQueue[0]);
    }
  }, [notificationQueue, showAchievement]);

  // Wenn ein Achievement angezeigt wird, nach 3s wieder ausblenden und aus Queue entfernen
  useEffect(() => {
    if (showAchievement) {
      // Markiere als gesehen, sobald angezeigt
      markAchievementNotificationSeen(showAchievement.id);
      const timer = setTimeout(() => {
        setShowAchievement(null);
        setNotificationQueue(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAchievement, markAchievementNotificationSeen]);

  return {
    showAchievement,
    notificationQueue,
    setShowAchievement,
    setNotificationQueue,
    hasAnyAchievement,
  };
}
