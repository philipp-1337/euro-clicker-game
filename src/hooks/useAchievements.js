import { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

export function useAchievements(gameConfig) {
  const [achievementBanner, setAchievementBanner] = useState(null);
  
  // Funktionalität von useAchievementBanner
  useEffect(() => {
    const handler = (e) => {
      const achievementId = e?.detail?.id;
      if (achievementId) {
        const achievement = gameConfig.achievements.find(a => a.id === achievementId);
        if (achievement) {
          setAchievementBanner(`${achievement.label} unlocked!`);
          setTimeout(() => setAchievementBanner(null), 3500);
        }
      }
    };
    window.addEventListener('game:achievement', handler);
    return () => window.removeEventListener('game:achievement', handler);
  }, [gameConfig]);

  // Ursprüngliche Funktionalität von useAchievements
  const enrichedAchievements = gameConfig.achievements.map(a => ({
    ...a,
    icon: (() => {
      const IconComp = LucideIcons[a.icon] || LucideIcons['FileQuestion'];
      return <IconComp size={32} color={a.color || '#888'} />;
    })(),
  }));
  
  // Für Abwärtskompatibilität: Der Hook gibt sowohl die angereicherte Liste zurück
  // als auch die einzelnen Eigenschaften als Objekt für die neue Verwendung
  const result = enrichedAchievements;
  result.achievements = enrichedAchievements;
  result.achievementBanner = achievementBanner;
  
  return result;
}