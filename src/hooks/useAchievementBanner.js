import { useState, useEffect } from 'react';
import { gameConfig } from '@constants/gameConfig';

export function useAchievementBanner() {
  const [achievementBanner, setAchievementBanner] = useState(null);

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
  }, []);

  return achievementBanner;
}
