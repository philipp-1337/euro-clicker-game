import { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

export function useAchievements(gameConfig) {
  const [achievementBanner, setAchievementBanner] = useState(null);
  
  // Achievement Banner Handler
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

  // Memoized enriched achievements with icons
  const enrichedAchievements = useMemo(() => 
    gameConfig.achievements.map(a => ({
      ...a,
      icon: (() => {
        const IconComp = LucideIcons[a.icon] || LucideIcons['FileQuestion'];
        return <IconComp size={32} color={a.color || '#888'} />;
      })(),
    }))
  , [gameConfig.achievements]);

  return {
    achievements: enrichedAchievements,
    achievementBanner,
  };
}